if ENV['SENTRY_DSN']
  Sentry.init do |config|
    config.dsn = ENV['SENTRY_DSN']
    config.breadcrumbs_logger = [:active_support_logger, :http_logger]

    # Set tracesSampleRate to 1.0 to capture 100%
    # of transactions for performance monitoring.
    # We recommend adjusting this value in production
    # config.traces_sample_rate = 0.1
    # or
    config.traces_sampler = lambda do |context|
      transaction_context = context[:transaction_context]

      op = transaction_context[:op]
      transaction_name = transaction_context[:name]

      case op
      when /http/
        case transaction_name
        when /metrics/
          0.0
        else
          0.005
        end
      else
        0.0
      end
    end

    config.rails.report_rescued_exceptions = false
    config.environment = ENV['SENTRY_ENVIRONMENT'] if ENV['ALTERNATE_DOMAINS']
  end
end
