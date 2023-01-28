# frozen_string_literal: true

class TranslationService::TranslateProxy < TranslationService
  include JsonLdHelper

  def initialize(endpoint, papago_client_id, papago_client_secret)
    super()

    @endpoint = endpoint

    @papago_endpoint = 'https://openapi.naver.com/v1/papago/n2mt'
    @papago_languages = %w(ko en ja zh-CN zh-TW es fr de ru pt it vi th id hi)
    @papago_client_id = papago_client_id
    @papago_client_secret = papago_client_secret
  end

  def translate(text, source_language, target_language)
    use_papago = @papago_client_id.present? && @papago_languages.include?(source_language) && @papago_languages.include?(target_language)

    text = sanitize(text)

    begin
      return translate_papago(text, source_language, target_language) if use_papago
      translate_proxy(text, source_language, target_language)
    rescue QuotaExceededError, UnexpectedResponseError
      translate_proxy(text, source_language, target_language)
    end
  end

  private

  def sanitize(text)
    text
      .gsub(/<br\s*\/?>/, "\n") # Replace br tag to newline
      .gsub(%r{</?[^>]+?>}, '') # Remove HTML tags
  end

  def restore_text(text)
    # Restore newline
    text.gsub("\n", '<br />') if text.present?
  end

  def translate_papago(text, source_language, target_language)
    Request.new(:post, @papago_endpoint, form: {
      source: source_language,
      target: target_language,
      text: text,
    }).add_headers(
      'X-Naver-Client-Id' => @papago_client_id,
      'X-Naver-Client-Secret' => @papago_client_secret,
      'Content-Type' => 'application/x-www-form-urlencoded; charset=UTF-8'
    ).perform do |res|
      case res.code
      when 429
        raise QuotaExceededError
      when 200...300
        transform_response_papago(res.body_with_limit, source_language)
      else
        raise UnexpectedResponseError
      end
    end
  end

  def translate_proxy(text, source_language, target_language)
    Request.new(:post, "#{@endpoint}/#{target_language}", form: { text: text }).perform do |res|
      case res.code
      when 429
        raise TooManyRequestsError
      when 456
        raise QuotaExceededError
      when 200...300
        transform_response_gproxy(res.body_with_limit, source_language)
      else
        raise UnexpectedResponseError
      end
    end
  end

  def transform_response_papago(str, source_language)
    json = Oj.load(str, mode: :strict)

    raise UnexpectedResponseError unless json.is_a?(Hash)

    text = json['message']['result']['translatedText']
    provider = 'Papago'

    text = restore_text(text)

    Translation.new(text: text, detected_source_language: source_language, provider: provider)
  rescue Oj::ParseError
    raise UnexpectedResponseError
  end

  def transform_response_gproxy(str, source_language)
    json = Oj.load(str, mode: :strict)

    raise UnexpectedResponseError unless json.is_a?(Hash)

    text = json['text']
    provider = 'Google Translate proxy'

    text = restore_text(text)

    Translation.new(text: text, detected_source_language: source_language, provider: provider)
  rescue Oj::ParseError
    raise UnexpectedResponseError
  end
end
