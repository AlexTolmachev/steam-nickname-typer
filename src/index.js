const EPersonaState = require('steam-user/enums/EPersonaState');
const readlineSync = require('readline-sync');
const SteamUser = require('steam-user');
const Steam = require('steam');

const accountName = readlineSync.question('Login: ');
const password = readlineSync.question('Password: ');
const baseNickname = readlineSync.question('Nickname: ');
const baseSuffix = readlineSync.question('Suffix to "type": ');

const placeholder = '_';
const freezeCount = 3;

let dynamicSuffix = baseSuffix;
let dynamicNickname = `${baseNickname} ${baseSuffix}`;

let steamClient = new Steam.SteamClient();
let steamUser = new SteamUser(steamClient);

console.log('Initializing...');

steamUser.on('loggedOn', async () => {
  console.log('Steam user logged on');

  steamUser.setPersona(EPersonaState.Online, dynamicNickname);

  let counter = -1;
  let switcher = false;

  setInterval(() => {
    if (counter >= dynamicSuffix.length - 1 && counter < dynamicSuffix.length - 1 + freezeCount && switcher) {
      counter += 1;
      return;
    }

    if (counter >= dynamicSuffix.length - 1) {
      counter = 0;
      switcher = !switcher;
    } else {
      counter += 1;
    }

    const dynamicSuffixChars = dynamicSuffix.split('');
    dynamicSuffixChars[counter] = switcher ? baseSuffix[counter] : placeholder;
    dynamicSuffix = dynamicSuffixChars.join('');

    dynamicNickname = `${baseNickname} ${dynamicSuffix}`;

    steamUser.setPersona(EPersonaState.Online, dynamicNickname);
  }, 1000);
});

let firstConnect = true;

steamClient.on('connected', () => {
  if (!firstConnect) return;

  steamUser.logOn({
    machineName: 'nickname_typing_script',
    rememberPassword: true,
    accountName,
    password,
  });

  firstConnect = false;
});

steamClient.on('error', () => steamClient.connect());

steamClient.connect();
