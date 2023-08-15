# frozen_string_literal: true

module CaptchaConcern
  extend ActiveSupport::Concern

  include Hcaptcha::Adapters::ViewMethods

  included do
    helper_method :render_captcha
  end

  def captcha_available?
    hcaptcha_available?
  end

  def captcha_enabled?
    hcaptcha_enabled? || korean_captcha_enabled?
  end

  def hcaptcha_available?
    ENV['HCAPTCHA_SECRET_KEY'].present? && ENV['HCAPTCHA_SITE_KEY'].present?
  end

  def hcaptcha_enabled?
    hcaptcha_available? && Setting.captcha_enabled
  end

  def korean_captcha_enabled?
    Setting.korean_captcha_enabled
  end

  def captcha_user_bypass?
    false
  end

  def captcha_required?
    (hcaptcha_enabled? || korean_captcha_enabled?) && !captcha_user_bypass?
  end

  def verify_korean_captcha
    params['korean_captcha_answer'] == Setting.korean_captcha_answer
  end

  def check_captcha!
    return true unless captcha_required?

    if hcaptcha_enabled? && !verify_hcaptcha
      if block_given?
        message = flash[:hcaptcha_error]
        flash.delete(:hcaptcha_error)
        yield message
      end

      false
    elsif korean_captcha_enabled? && !verify_korean_captcha
      yield I18n.t('auth.korean_captcha_fail')
      false
    else
      true
    end
  end

  def extend_csp_for_captcha!
    policy = request.content_security_policy&.clone

    return unless hcaptcha_enabled? && policy.present?

    %w(script_src frame_src style_src connect_src).each do |directive|
      values = policy.send(directive)

      values << 'https://hcaptcha.com' unless values.include?('https://hcaptcha.com') || values.include?('https:')
      values << 'https://*.hcaptcha.com' unless values.include?('https://*.hcaptcha.com') || values.include?('https:')

      policy.send(directive, *values)
    end

    request.content_security_policy = policy
  end

  def render_captcha
    return unless captcha_required?

    hcaptcha_tags
  end
end
