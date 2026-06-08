import tgImg  from './assets/icons/telegram.svg';
import igImg  from './assets/icons/instagram.svg';
import ytImg  from './assets/icons/youtube.svg';
import ttImg  from './assets/icons/tiktok.svg';
import twImg  from './assets/icons/twitter.svg';
import vkImg  from './assets/icons/vk.svg';
import dcImg  from './assets/icons/discord.svg';
import tcImg  from './assets/icons/twitch.svg';
import spImg  from './assets/icons/spotify.svg';
import fbImg  from './assets/icons/facebook.svg';
import waImg  from './assets/icons/whatsapp.svg';
import mxImg  from './assets/icons/max.svg';
import webImg from './assets/icons/web.svg';

// To use real PNGs from flaticon: place them in src/assets/icons/ with same filenames (.png)
// then change each import above from .svg to .png

const NetIcon = ({ src, alt }) => (
  <img
    src={src}
    alt={alt}
    style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', borderRadius:'inherit' }}
  />
);

export const icons = {
  telegram:  <NetIcon src={tgImg}  alt="Telegram" />,
  instagram: <NetIcon src={igImg}  alt="Instagram" />,
  youtube:   <NetIcon src={ytImg}  alt="YouTube" />,
  tiktok:    <NetIcon src={ttImg}  alt="TikTok" />,
  twitter:   <NetIcon src={twImg}  alt="Twitter/X" />,
  vk:        <NetIcon src={vkImg}  alt="VK" />,
  discord:   <NetIcon src={dcImg}  alt="Discord" />,
  twitch:    <NetIcon src={tcImg}  alt="Twitch" />,
  spotify:   <NetIcon src={spImg}  alt="Spotify" />,
  facebook:  <NetIcon src={fbImg}  alt="Facebook" />,
  whatsapp:  <NetIcon src={waImg}  alt="WhatsApp" />,
  max:       <NetIcon src={mxImg}  alt="MAX" />,
  web:       <NetIcon src={webImg} alt="Web" />,
};

export const NETWORKS = [
  { id: 'telegram',  name: 'Telegram',    icon: 'telegram',  keywords: ['telegram','тг','tg'] },
  { id: 'instagram', name: 'Instagram',   icon: 'instagram', keywords: ['instagram','инст'] },
  { id: 'youtube',   name: 'YouTube',     icon: 'youtube',   keywords: ['youtube','ютуб','yt'] },
  { id: 'tiktok',    name: 'TikTok',      icon: 'tiktok',    keywords: ['tiktok','тик'] },
  { id: 'twitter',   name: 'Twitter / X', icon: 'twitter',   keywords: ['twitter','x','твиттер'] },
  { id: 'vk',        name: 'ВКонтакте',   icon: 'vk',        keywords: ['vk','вк','вконтакте'] },
  { id: 'discord',   name: 'Discord',     icon: 'discord',   keywords: ['discord','дискорд'] },
  { id: 'twitch',    name: 'Twitch',      icon: 'twitch',    keywords: ['twitch','твич'] },
  { id: 'spotify',   name: 'Spotify',     icon: 'spotify',   keywords: ['spotify','спотифай'] },
  { id: 'facebook',  name: 'Facebook',    icon: 'facebook',  keywords: ['facebook','фейсбук','fb'] },
  { id: 'whatsapp',  name: 'WhatsApp',    icon: 'whatsapp',  keywords: ['whatsapp','вотсап','wa'] },
  { id: 'max',       name: 'MAX',         icon: 'max',       keywords: ['max'] },
  { id: 'web',       name: 'Web трафик',  icon: 'web',       keywords: ['web','веб','трафик'] },
];
