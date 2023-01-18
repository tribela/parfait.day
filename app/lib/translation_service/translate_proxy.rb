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
    # Replace br tag to newline
    text = text.gsub(/<br\s*\/?>/, "\n")
    # Remove HTML tags
    text = text.gsub(%r{</?[^>]+?>}, '')

    Request.new(:post, "#{@endpoint}/#{target_language}", form: { text: text })
  end

  def transform_response(str, source_language)
    json = Oj.load(str, mode: :strict)

    raise UnexpectedResponseError unless json.is_a?(Hash)

    text = json['text']
    # Restore newline
    text = text.gsub("\n", '<br />') if text.present?

    Translation.new(text: text, detected_source_language: source_language, provider: 'Google Translate proxy')
  rescue Oj::ParseError
    raise UnexpectedResponseError
  end
end
