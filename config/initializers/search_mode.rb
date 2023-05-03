# frozen_string_literal: true

Rails.application.configure do
  supported_search_modes = %w(all discoverable)
  config.x.public_search_mode = ENV.fetch('PUBLIC_SEARCH_MODE', 'all')
  raise "Invalid search mode: #{config.x.public_search_mode}" if supported_search_modes.exclude?(config.x.public_search_mode)
end
