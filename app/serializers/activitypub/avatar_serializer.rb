# frozen_string_literal: true

class ActivityPub::AvatarSerializer < ActivityPub::ImageSerializer
  def url
    if !object.file?
      full_asset_url('/avatars/original/missing_qdon.png')
    else
      full_asset_url(object.url(:original))
    end
  end
end
