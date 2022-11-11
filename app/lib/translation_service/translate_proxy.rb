# frozen_string_literal: true

class TranslationService::TranslateProxy < TranslationService
  include JsonLdHelper

  def initialize(endpoint)
    super()

    @endpoint = endpoint
  end

  def translate(text, source_language, target_language)
    request(text, target_language).perform do |res|
      case res.code
      when 429
        raise TooManyRequestsError
      when 456
        raise QuotaExceededError
      when 200...300
        transform_response(res.body_with_limit, source_language)
      else
        raise UnexpectedResponseError
      end
    end
  end

  private

  def request(text, target_language)
    req = Request.new(:post, "#{@endpoint}/#{target_language}", form: { text: text })
    req.add_headers('Authorization': "DeepL-Auth-Key #{@api_key}")
    req
  end

  def transform_response(str, source_language)
    json = Oj.load(str, mode: :strict)

    raise UnexpectedResponseError unless json.is_a?(Hash)

    Translation.new(text: json['text'], detected_source_language: source_language, provider: 'Google Translate proxy')
  rescue Oj::ParseError
    raise UnexpectedResponseError
  end
end
