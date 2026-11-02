export function authErrorMessage(error){
 switch(error?.code){
  case 'auth/invalid-email':return 'Проверь адрес почты.';
  case 'auth/invalid-credential':
  case 'auth/wrong-password':
  case 'auth/user-not-found':return 'Не удалось войти. Проверь почту и пароль трекера.';
  case 'auth/user-disabled':return 'Этот аккаунт отключён в Firebase.';
  case 'auth/operation-not-allowed':return 'В Firebase нужно включить Email/Password в Authentication → Sign-in method.';
  case 'auth/network-request-failed':return 'Нет связи с Firebase. Проверь интернет и повтори вход.';
  case 'auth/too-many-requests':return 'Слишком много попыток. Подожди немного и попробуй снова.';
  case 'auth/unauthorized-domain':return 'Добавь домен сайта в Firebase → Authentication → Settings → Authorized domains.';
  case 'auth/invalid-api-key':
  case 'auth/app-not-authorized':return 'Проверь web-конфигурацию Firebase для этого сайта.';
  default:return `Не удалось выполнить вход. Код: ${String(error?.code||'unknown')}.`;
 }
}
