import tgImg   from './assets/icons/telegram.svg';
import tgPrem  from './assets/icons/telegram_premium.svg';
import igImg   from './assets/icons/instagram.svg';
import ytImg   from './assets/icons/youtube.svg';
import ttImg   from './assets/icons/tiktok.svg';
import twImg   from './assets/icons/twitter.svg';
import vkImg   from './assets/icons/vk.svg';
import dcImg   from './assets/icons/discord.svg';
import tcImg   from './assets/icons/twitch.svg';
import spImg   from './assets/icons/spotify.svg';
import fbImg   from './assets/icons/facebook.svg';
import waImg   from './assets/icons/whatsapp.svg';
import mxImg   from './assets/icons/max.svg';
import webImg  from './assets/icons/web.svg';
import kkImg   from './assets/icons/kick.svg';
import trImg   from './assets/icons/trovo.svg';
import lkImg   from './assets/icons/likee.svg';
import okImg   from './assets/icons/ok.svg';
import vcImg   from './assets/icons/vcru.svg';
import dtfImg  from './assets/icons/dtf.svg';
import pinImg  from './assets/icons/pinterest.svg';
import rtImg   from './assets/icons/rutube.svg';
import ypImg   from './assets/icons/yappy.svg';
import dzImg   from './assets/icons/dzen.svg';
import thImg   from './assets/icons/threads.svg';
import liImg   from './assets/icons/linkedin.svg';
import mdImg   from './assets/icons/medium.svg';
import avImg   from './assets/icons/avito.svg';
import wiImg   from './assets/icons/wibes.svg';
import smImg   from './assets/icons/steam.svg';
import shImg   from './assets/icons/shazam.svg';

// To replace with real PNGs: put files in src/assets/icons/ and change .svg → .png in imports

const I = ({ src, alt }) => (
  <img src={src} alt={alt} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', borderRadius:'inherit' }} />
);

export const icons = {
  telegram:         <I src={tgImg}   alt="Telegram" />,
  telegram_premium: <I src={tgPrem}  alt="Telegram Premium" />,
  instagram:        <I src={igImg}   alt="Instagram" />,
  youtube:          <I src={ytImg}   alt="YouTube" />,
  tiktok:           <I src={ttImg}   alt="TikTok" />,
  twitter:          <I src={twImg}   alt="Twitter/X" />,
  vk:               <I src={vkImg}   alt="VK" />,
  discord:          <I src={dcImg}   alt="Discord" />,
  twitch:           <I src={tcImg}   alt="Twitch" />,
  spotify:          <I src={spImg}   alt="Spotify" />,
  facebook:         <I src={fbImg}   alt="Facebook" />,
  whatsapp:         <I src={waImg}   alt="WhatsApp" />,
  max:              <I src={mxImg}   alt="MAX" />,
  web:              <I src={webImg}  alt="Web" />,
  kick:             <I src={kkImg}   alt="Kick" />,
  trovo:            <I src={trImg}   alt="Trovo" />,
  likee:            <I src={lkImg}   alt="Likee" />,
  ok:               <I src={okImg}   alt="ОК" />,
  vcru:             <I src={vcImg}   alt="VC.ru" />,
  dtf:              <I src={dtfImg}  alt="DTF" />,
  pinterest:        <I src={pinImg}  alt="Pinterest" />,
  rutube:           <I src={rtImg}   alt="Rutube" />,
  yappy:            <I src={ypImg}   alt="Yappy" />,
  dzen:             <I src={dzImg}   alt="Дзен" />,
  threads:          <I src={thImg}   alt="Threads" />,
  linkedin:         <I src={liImg}   alt="LinkedIn" />,
  medium:           <I src={mdImg}   alt="Medium" />,
  avito:            <I src={avImg}   alt="Авито" />,
  wibes:            <I src={wiImg}   alt="Wibes" />,
  steam:            <I src={smImg}   alt="Steam" />,
  shazam:           <I src={shImg}   alt="Shazam" />,
};

// ─── NETWORKS — top level ──────────────────────────────────────────────────────
// Each network can have subcategories (sub) which are matched via keywords
// If no sub field → direct service matching

export const NETWORKS = [
  {
    id: 'telegram', name: 'Telegram', icon: 'telegram',
    sub: [
      { id: 'tg_boosts',   name: 'Бусты',          icon: 'telegram',         keywords: ['telegram бусты','telegram boost','бусты'] },
      { id: 'tg_stars',    name: 'Звёзды',          icon: 'telegram',         keywords: ['telegram звезды','telegram stars','звезды','stars'] },
      { id: 'tg_premium',  name: 'Telegram Premium', icon: 'telegram_premium', keywords: ['telegram premium','premium'] },
      { id: 'tg_subs',     name: 'Подписчики',      icon: 'telegram',         keywords: ['telegram подписчики','telegram subscribers'] },
      { id: 'tg_views',    name: 'Просмотры',       icon: 'telegram',         keywords: ['telegram просмотры','telegram views'] },
      { id: 'tg_reactions',name: 'Реакции',         icon: 'telegram',         keywords: ['telegram реакции','telegram reactions'] },
      { id: 'tg_other',    name: 'Остальное',       icon: 'telegram',         keywords: ['telegram'] },
    ],
  },
  {
    id: 'instagram', name: 'Instagram', icon: 'instagram',
    sub: [
      { id: 'ig_followers', name: 'Подписчики', icon: 'instagram', keywords: ['instagram followers','instagram подписчики'] },
      { id: 'ig_likes',     name: 'Лайки',      icon: 'instagram', keywords: ['instagram likes','instagram лайки'] },
      { id: 'ig_views',     name: 'Просмотры',  icon: 'instagram', keywords: ['instagram views','instagram просмотры'] },
      { id: 'ig_comments',  name: 'Комментарии',icon: 'instagram', keywords: ['instagram comments','instagram комментарии'] },
      { id: 'ig_other',     name: 'Остальное',  icon: 'instagram', keywords: ['instagram'] },
    ],
  },
  {
    id: 'youtube', name: 'YouTube', icon: 'youtube',
    sub: [
      { id: 'yt_subs',     name: 'Подписчики', icon: 'youtube', keywords: ['youtube subscribers','youtube подписчики'] },
      { id: 'yt_views',    name: 'Просмотры',  icon: 'youtube', keywords: ['youtube views','youtube просмотры'] },
      { id: 'yt_likes',    name: 'Лайки',      icon: 'youtube', keywords: ['youtube likes','youtube лайки'] },
      { id: 'yt_comments', name: 'Комментарии',icon: 'youtube', keywords: ['youtube comments','youtube комментарии'] },
      { id: 'yt_other',    name: 'Остальное',  icon: 'youtube', keywords: ['youtube'] },
    ],
  },
  {
    id: 'tiktok', name: 'TikTok', icon: 'tiktok',
    sub: [
      { id: 'tt_followers', name: 'Подписчики', icon: 'tiktok', keywords: ['tiktok followers','tiktok подписчики'] },
      { id: 'tt_likes',     name: 'Лайки',      icon: 'tiktok', keywords: ['tiktok likes','tiktok лайки'] },
      { id: 'tt_views',     name: 'Просмотры',  icon: 'tiktok', keywords: ['tiktok views','tiktok просмотры'] },
      { id: 'tt_other',     name: 'Остальное',  icon: 'tiktok', keywords: ['tiktok','tik-tok','тик'] },
    ],
  },
  { id: 'twitter',   name: 'Twitter / X',    icon: 'twitter',   keywords: ['twitter','x '] },
  { id: 'vk',        name: 'ВКонтакте',      icon: 'vk',        keywords: ['vkontakte','вконтакте',' vk ','vk '] },
  { id: 'discord',   name: 'Discord',         icon: 'discord',   keywords: ['discord'] },
  { id: 'twitch',    name: 'Twitch',          icon: 'twitch',    keywords: ['twitch'] },
  { id: 'spotify',   name: 'Spotify',         icon: 'spotify',   keywords: ['spotify'] },
  { id: 'facebook',  name: 'Facebook',        icon: 'facebook',  keywords: ['facebook'] },
  { id: 'whatsapp',  name: 'WhatsApp',        icon: 'whatsapp',  keywords: ['whatsapp'] },
  { id: 'max',       name: 'MAX',             icon: 'max',       keywords: ['max'] },
  { id: 'kick',      name: 'Kick',            icon: 'kick',      keywords: ['kick'] },
  { id: 'trovo',     name: 'Trovo',           icon: 'trovo',     keywords: ['trovo'] },
  { id: 'likee',     name: 'Likee',           icon: 'likee',     keywords: ['likee'] },
  { id: 'ok',        name: 'Одноклассники',   icon: 'ok',        keywords: ['одноклассники','ok.ru'] },
  { id: 'vcru',      name: 'VC.ru',           icon: 'vcru',      keywords: ['vc.ru','vc'] },
  { id: 'dtf',       name: 'DTF',             icon: 'dtf',       keywords: ['dtf'] },
  { id: 'pinterest', name: 'Pinterest',       icon: 'pinterest', keywords: ['pinterest'] },
  { id: 'rutube',    name: 'Rutube',          icon: 'rutube',    keywords: ['rutube','рутуб'] },
  { id: 'yappy',     name: 'Yappy',           icon: 'yappy',     keywords: ['yappy'] },
  { id: 'dzen',      name: 'Дзен',            icon: 'dzen',      keywords: ['дзен','dzen'] },
  { id: 'threads',   name: 'Threads',         icon: 'threads',   keywords: ['threads'] },
  { id: 'linkedin',  name: 'LinkedIn',        icon: 'linkedin',  keywords: ['linkedin'] },
  { id: 'medium',    name: 'Medium',          icon: 'medium',    keywords: ['medium'] },
  { id: 'avito',     name: 'Авито',           icon: 'avito',     keywords: ['авито','avito'] },
  { id: 'wibes',     name: 'Wibes',           icon: 'wibes',     keywords: ['wibes'] },
  { id: 'steam',     name: 'Steam',           icon: 'steam',     keywords: ['steam'] },
  { id: 'shazam',    name: 'Shazam',          icon: 'shazam',    keywords: ['shazam'] },
  { id: 'web',       name: 'Трафик на сайт',  icon: 'web',       keywords: ['web','трафик на сайт','website traffic'] },
];
