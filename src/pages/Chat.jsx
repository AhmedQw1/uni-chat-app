import { useParams } from 'react-router-dom';
import Header from '../components/Layout/Header';
import ChatRoom from '../components/Chat/ChatRoom';

export default function Chat() {
  const { groupId } = useParams();

  return (
    <div className="app-container">
      <Header />
      <ChatRoom />
    </div>
  );
}