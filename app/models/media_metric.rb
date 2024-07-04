# frozen_string_literal: true

# == Schema Information
#
# Table name: media_metrics
#
#  category  :text             primary key
#  file_size :bigint(8)
#  local     :boolean          primary key
#
class MediaMetric < ApplicationRecord
  include DatabaseViewRecord

  self.primary_key = :category, :local
end
