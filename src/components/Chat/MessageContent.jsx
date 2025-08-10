export default function MessageContent({ message }) {
  if (!message) return null;
  
  // File rendering logic
  if (message.file) {
    switch (message.file.fileType) {
      case 'image':
        return <img src={message.file.url} alt={message.file.name} className="max-w-xs h-auto rounded border" />;
      case 'audio':
        return <audio src={message.file.url} controls className="w-full h-8" />;
      case 'video':
        return <video src={message.file.url} controls className="max-w-xs rounded" style={{ maxHeight: '200px' }} />;
      default:
        return (
          <a href={message.file.url} download={message.file.name} className="text-blue-800 underline">
            {message.file.name}
          </a>
        );
    }
  }
  
  // Emoji rendering
  if (message.text && /^\p{Emoji}+$/u.test(message.text.trim())) {
    return <span style={{ fontSize: '2rem' }}>{message.text}</span>;
  }
  
  // Default text
  return <span>{message.text}</span>;
}