import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Smartphone, WifiOff } from 'lucide-react';
import { joinUrl, useRoom } from '../net/RoomContext';

function Qr({ url }: { url: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    QRCode.toDataURL(url, { width: 480, margin: 1, errorCorrectionLevel: 'M', color: { dark: '#0c0b14', light: '#ffffff' } })
      .then((data) => live && setSrc(data))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [url]);
  return src ? <img className="qr" src={src} alt={`QR להצטרפות: ${url}`} /> : <div className="qr qr--loading" />;
}

/** QR + code for joining the screen's room as the host remote, with how many phones are in. */
export default function JoinPanel() {
  const { room } = useRoom();

  if (room.status === 'offline' && !room.code) {
    return (
      <p className="join__status join__status--bad">
        <WifiOff size={16} /> אין חיבור לשרת. אפשר להמשיך לשחק מהמסך.
      </p>
    );
  }
  if (!room.code) return <p className="join__status">פותחים חדר…</p>;

  const url = joinUrl(room.code);
  return (
    <div className="join">
      <Qr url={url} />
      <div className="join__text">
        <p className="join__label">סרקו עם הטלפון, או היכנסו ל־</p>
        <p className="join__url" dir="ltr">{url.replace(/^https?:\/\//, '')}</p>
        <p className="join__code" dir="ltr">{room.code}</p>
        <p className={`join__status ${room.status === 'live' ? '' : 'join__status--bad'}`}>
          {room.status !== 'live' ? (
            <>
              <WifiOff size={16} /> מתחברים מחדש…
            </>
          ) : room.remotes > 0 ? (
            <>
              <Smartphone size={16} /> {room.remotes === 1 ? 'טלפון אחד מחובר' : `${room.remotes} טלפונים מחוברים`}
            </>
          ) : (
            'עוד אין טלפון מחובר. עד אז שולטים מהמסך.'
          )}
        </p>
      </div>
    </div>
  );
}
