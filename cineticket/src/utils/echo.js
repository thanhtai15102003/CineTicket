import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'reverb',
    key: 'kqe2fbbssrdcyvt6oe7a', // Reverb App Key
    wsHost: 'web-production-39196.up.railway.app', // Địa chỉ Reverb Server
    wsPort: 80,
    wssPort: 443,
    forceTLS: true,
    enabledTransports: ['ws', 'wss']
});

export default echo;
