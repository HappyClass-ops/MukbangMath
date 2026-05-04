const globalFirebaseConfig = {
  apiKey: "AIzaSyBi59AatBp6MGR2RoutSsmK8QuI2Uz5R7A",
  authDomain: "math-arcade-cd8d6.firebaseapp.com",
  projectId: "math-arcade-cd8d6",
  storageBucket: "math-arcade-cd8d6.firebasestorage.app",
  messagingSenderId: "985641392692",
  appId: "1:985641392692:web:856274d3fa384e99a80861"
};
if (!firebase.apps.length) firebase.initializeApp(globalFirebaseConfig);
window.globalDb = firebase.firestore();
window.globalAuth = firebase.auth();
window.globalAuth.signInAnonymously().catch(e => console.log("Auth err:", e));
