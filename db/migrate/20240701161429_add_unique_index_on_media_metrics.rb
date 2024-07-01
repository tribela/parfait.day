# frozen_string_literal: true

class AddUniqueIndexOnMediaMetrics < ActiveRecord::Migration[7.1]
  def change
    # To refresh the view concurrently
    safety_assured { add_index :media_metrics, [:category, :local], unique: true }
  end
end
