export const T = {
  en: {
    tagline: 'GALAXY ARMOR CHARACTER LAB',
    heroEyebrow: 'A CINEMATIC ARCHIVE OF CYBERNETIC MUSES',
    heroDesc: 'Upload your character. Enter the galaxy. Every frame is a weaponized fashion statement.',
    ctaEnter: 'ENTER ARCHIVE', cta3d: 'VIEW 3D MODEL', ctaUpload: 'UPLOAD CHARACTER',
    secArchive: 'CHARACTER ARCHIVE', secShowroom: '3D INTERACTIVE SHOWROOM', secLab: 'UPLOAD CHARACTER LAB',
    adminTitle: 'ADMIN CONSOLE', signIn: 'SIGN IN', signOut: 'SIGN OUT',
    save: 'SAVE CHARACTER', cancel: 'CANCEL', newChar: 'NEW CHARACTER',
    analyzing: 'ANALYZING CHARACTER...', addArchive: 'ADD TO ARCHIVE',
    motionReel: 'MOTION REEL', importVideo: 'IMPORT VIDEO', removeVideo: 'REMOVE',
    videoLibrary: 'VIDEO LIBRARY', manageVideos: 'VIDEO LIBRARY', newVideo: 'NEW VIDEO',
    saveVideo: 'SAVE VIDEO', secVideos: 'VIDEO LIBRARY', backToChars: 'CHARACTERS'
  },
  zh: {
    tagline: '銀河機甲角色實驗室',
    heroEyebrow: '賽博繆斯的電影級檔案庫',
    heroDesc: '上傳你的角色，進入銀河。每一幀都是武裝化的時尚宣言。',
    ctaEnter: '進入檔案庫', cta3d: '觀看 3D 模型', ctaUpload: '上傳角色',
    secArchive: '角色檔案庫', secShowroom: '3D 互動展示間', secLab: '角色上傳實驗室',
    adminTitle: '管理後台', signIn: '登入', signOut: '登出',
    save: '儲存角色', cancel: '取消', newChar: '新增角色',
    analyzing: '角色分析中...', addArchive: '加入檔案庫',
    motionReel: '動態影片', importVideo: '導入影片', removeVideo: '移除',
    videoLibrary: '影片庫', manageVideos: '影片庫', newVideo: '新增影片',
    saveVideo: '儲存影片', secVideos: '影片庫', backToChars: '角色管理'
  }
};

export function useLang() {
  const [lang, setLang] = React.useState(localStorage.getItem('nm_lang') || 'en');
  const toggle = () => {
    const next = lang === 'en' ? 'zh' : 'en';
    localStorage.setItem('nm_lang', next);
    setLang(next);
  };
  return { lang, t: T[lang], toggle };
}
import React from 'react';