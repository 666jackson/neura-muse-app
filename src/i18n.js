import React from 'react';

// Language cycle order for the toggle button: EN → 中文 → 日本語 → EN …
export const LANGS = ['en', 'zh', 'ja'];
// Label shown on the toggle button = the NEXT language you'll switch to.
export const NEXT_LANG_LABEL = { en: '中文', zh: '日本語', ja: 'EN' };

export const T = {
  en: {
    tagline: 'GALAXY ARMOR CHARACTER LAB',
    heroEyebrow: 'A CINEMATIC ARCHIVE OF CYBERNETIC MUSES',
    heroDesc: 'Upload your character. Enter the galaxy. Every frame is a weaponized fashion statement.',
    ctaEnter: 'ENTER ARCHIVE', ctaVideo: 'WATCH REELS', ctaUpload: 'UPLOAD CHARACTER',
    ctaDaily: 'DAILY MUSE', ctaOracle: 'ORACLE', pickReel: 'SELECT A REEL — SWIPE ▸',
    secArchive: 'CHARACTER ARCHIVE', secVideos: 'MOTION VIDEO REELS', secLab: 'UPLOAD CHARACTER LAB',
    noVideos: 'NO VIDEOS PUBLISHED YET',
    adminTitle: 'ADMIN CONSOLE', signIn: 'SIGN IN', signOut: 'SIGN OUT',
    save: 'SAVE CHARACTER', cancel: 'CANCEL', newChar: 'NEW CHARACTER', quickAdd: 'QUICK ADD',
    quickAddHint: 'Drop many images — each is auto-named + auto-analyzed and saved as a character.', adding: 'UPLOADING',
    analyzing: 'ANALYZING CHARACTER...', addArchive: 'ADD TO ARCHIVE', registered: 'UNIT REGISTERED — SEE ARCHIVE',
    motionReel: 'MOTION REEL', importVideo: 'IMPORT VIDEO', removeVideo: 'REMOVE',
    videoLibrary: 'VIDEO LIBRARY', manageVideos: 'VIDEO LIBRARY', newVideo: 'NEW VIDEO',
    saveVideo: 'SAVE VIDEO', backToChars: 'CHARACTERS',
    audioLibrary: 'SOUNDTRACK', manageAudio: 'SOUNDTRACK', newTrack: 'NEW TRACK',
    importAudio: 'IMPORT AUDIO', removeAudio: 'REMOVE', saveTrack: 'SAVE TRACK',
    musicPlay: 'PLAY SOUNDTRACK', musicPause: 'PAUSE SOUNDTRACK',
    navArchive: 'ARCHIVE', navVideos: 'VIDEOS', navLab: 'LAB', navUpload: 'UPLOAD',
    introEyebrow: 'INITIALIZING ARCHIVE — SECTOR 07', introFooter: 'CALIBRATING NEURAL LINK'
  },
  zh: {
    tagline: '銀河機甲角色實驗室',
    heroEyebrow: '賽博繆斯的電影級檔案庫',
    heroDesc: '上傳你的角色，進入銀河。每一幀都是武裝化的時尚宣言。',
    ctaEnter: '進入檔案庫', ctaVideo: '觀看影片', ctaUpload: '上傳角色',
    ctaDaily: '今日繆斯', ctaOracle: '神諭占卜', pickReel: '選擇影片 — 向右滑動 ▸',
    secArchive: '角色檔案庫', secVideos: '動態影片集', secLab: '角色上傳實驗室',
    noVideos: '尚未發佈任何影片',
    adminTitle: '管理後台', signIn: '登入', signOut: '登出',
    save: '儲存角色', cancel: '取消', newChar: '新增角色', quickAdd: '快速上傳',
    quickAddHint: '拖入多張圖片 — 每張自動命名、自動分析並存成角色。', adding: '上傳中',
    analyzing: '角色分析中...', addArchive: '加入檔案庫', registered: '機體已註冊 — 請見檔案庫',
    motionReel: '動態影片', importVideo: '導入影片', removeVideo: '移除',
    videoLibrary: '影片庫', manageVideos: '影片庫', newVideo: '新增影片',
    saveVideo: '儲存影片', backToChars: '角色管理',
    audioLibrary: '配樂', manageAudio: '配樂', newTrack: '新增配樂',
    importAudio: '導入音樂', removeAudio: '移除', saveTrack: '儲存配樂',
    musicPlay: '播放配樂', musicPause: '暫停配樂',
    navArchive: '檔案庫', navVideos: '影片', navLab: '實驗室', navUpload: '上傳',
    introEyebrow: '正在初始化檔案庫 — 區段 07', introFooter: '神經連結校準中'
  },
  ja: {
    tagline: 'ギャラクシー・アーマー・キャラクターラボ',
    heroEyebrow: 'サイバネティック・ミューズの映画的アーカイブ',
    heroDesc: 'キャラクターをアップロードし、銀河へ。すべてのフレームが武装化されたファッション宣言。',
    ctaEnter: 'アーカイブへ', ctaVideo: '映像を見る', ctaUpload: 'キャラクターを投稿',
    ctaDaily: '今日のミューズ', ctaOracle: '神託', pickReel: 'リールを選ぶ — スワイプ ▸',
    secArchive: 'キャラクターアーカイブ', secVideos: 'モーション映像リール', secLab: 'キャラクター投稿ラボ',
    noVideos: 'まだ公開された映像はありません',
    adminTitle: '管理コンソール', signIn: 'ログイン', signOut: 'ログアウト',
    save: 'キャラクターを保存', cancel: 'キャンセル', newChar: '新規キャラクター', quickAdd: 'クイック追加',
    quickAddHint: '複数の画像をドロップ — 自動で命名・解析してキャラクターとして保存。', adding: 'アップロード中',
    analyzing: 'キャラクターを解析中...', addArchive: 'アーカイブに追加', registered: 'ユニット登録完了 — アーカイブを確認',
    motionReel: 'モーションリール', importVideo: '映像をインポート', removeVideo: '削除',
    videoLibrary: '映像ライブラリ', manageVideos: '映像ライブラリ', newVideo: '新規映像',
    saveVideo: '映像を保存', backToChars: 'キャラクター',
    audioLibrary: 'BGM', manageAudio: 'BGM', newTrack: '新規トラック',
    importAudio: '音源をインポート', removeAudio: '削除', saveTrack: 'トラックを保存',
    musicPlay: 'BGMを再生', musicPause: 'BGMを停止',
    navArchive: 'アーカイブ', navVideos: '映像', navLab: 'ラボ', navUpload: '投稿',
    introEyebrow: 'アーカイブを初期化中 — セクター 07', introFooter: 'ニューラルリンクを校正中'
  }
};

export function nextLang(lang) {
  const i = LANGS.indexOf(lang);
  return LANGS[(i + 1) % LANGS.length];
}

export function useLang() {
  const [lang, setLang] = React.useState(localStorage.getItem('nm_lang') || 'en');
  const toggle = () => {
    const next = nextLang(lang);
    localStorage.setItem('nm_lang', next);
    setLang(next);
  };
  return { lang, t: T[lang], toggle };
}
