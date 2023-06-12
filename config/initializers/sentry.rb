# frozen_string_literal: true

if ENV['SENTRY_DSN']
  Sentry.init do |config|
    config.dsn = ENV['SENTRY_DSN']
    config.breadcrumbs_logger = [:active_support_logger, :http_logger]

    config.excluded_exceptions += [
      'ActiveRecord::RecordNotUnique',
      'HTTP::ConnectionError',
      'HTTP::StateError',
      'HTTP::TimeoutError',
      'OpenSSL::SSL::SSLError',
      'Stoplight::Error::RedLight',
    ]

    # Set tracesSampleRate to 1.0 to capture 100%
    # of transactions for performance monitoring.
    # We recommend adjusting this value in production
    # config.traces_sample_rate = 0.1
    # or
    config.traces_sampler = lambda do |sampling_context|
      next sampling_context[:parent_sampled] unless sampling_context[:parent_sampled].nil?

      transaction_context = sampling_context[:transaction_context]

      op = transaction_context[:op]
      transaction_name = transaction_context[:name]

      case op
      when /http/
        case transaction_name
        when /metrics/
          0.001
        else
          0.005
        end
      when /sidekiq/
        0.001
      else
        0.0
      end
    end

    # The profiles_sample_rate setting is relative to the traces_sample_rate setting.
    config.profiles_sample_rate = 1.0

    config.rails.report_rescued_exceptions = false
    config.environment = ENV.fetch('SENTRY_ENVIRONMENT', 'production')
  end
end
