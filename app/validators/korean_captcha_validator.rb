# frozen_string_literal: true

class KoreanCaptchaValidator < ActiveModel::Validator
  def validate(user)
    user.errors.add(:korean_captcha, I18n.t('auth.korean_captcha_fail')) if user.korean_captcha.blank? || user.korean_captcha != Setting.korean_captcha_answer
  end
end
