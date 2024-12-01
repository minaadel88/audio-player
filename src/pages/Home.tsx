import { useState } from 'react';
import SidebarContainer from '../components/Sidebar/SidebarContainer';
import VideoTable from '../components/VideoTable';
import { CHANNELS } from '../lib/constants';

export default function Home() {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(CHANNELS[0].id);

  return (
    <div className="flex min-h-screen">
      <SidebarContainer
        selectedChannel={selectedChannel}
        onChannelSelect={setSelectedChannel}
      />
      <div className="video-table-container">
        <VideoTable channelId={selectedChannel} />
      </div>
    </div>
  );
}