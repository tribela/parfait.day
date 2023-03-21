# frozen_string_literal: true

require 'prometheus/client/registry'
require 'sidekiq'

module MastodonPrometheus
  mattr_reader :registry do
    reg = Prometheus::Client::Registry.new

    reg.gauge(:sidekiq_jobs_waiting_count, labels: [:queue], docstring: 'The number of jobs waiting to process in sidekiq.')
    reg.gauge(:sidekiq_queues_latency, labels: [:queue], docstring: 'The waiting time of queues in sidekiq')
    reg.gauge(:sidekiq_retry_count, docstring: 'The number of jobs waiting to retry in sidekiq.')
    reg.gauge(:sidekiq_dead_count, docstring: 'The number of jobs dead in sidekiq.')

    reg.gauge(:sidekiq_total_processed_count, docstring: 'The whole number of jobs processed.')
    reg.gauge(:sidekiq_total_failed_count, docstring: 'The whole number of jobs failed.')

    reg.gauge(:mastodon_user_count, docstring: 'The number of users in mastodon.')
    reg.gauge(:mastodon_status_count, docstring: 'The number of statuses in mastodon.')
    reg.gauge(:mastodon_domain_count, docstring: 'The number of domains in mastodon.')
    reg.gauge(:mastodon_sign_up_count, labels: %I[days], docstring: 'The number of sign ups in mastodon.')

    reg.gauge(:mastodon_active_user, labels: %I[weeks], docstring: 'The number of active users in mastodon.')
    reg.gauge(:mastodon_active_post, labels: %I[hours by], docstring: 'The number of active posts in mastodon.')

    reg.gauge(:mastodon_database_size, docstring: 'The size of postgres db.')
    reg.gauge(:mastodon_redis_size, docstring: 'The size of redis db.')

    reg.gauge(:mastodon_media_size, labels: %I[type by], docstring: 'The size of media files.')

    reg
  end

  class << self
    delegate :counter, :gauge, :histogram, :summary, :get, to: :registry
  end
end
