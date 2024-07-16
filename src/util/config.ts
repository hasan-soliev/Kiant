import {initializeApp} from 'firebase/app';
import {getFirestore} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDJKoBMgwolNMrATu9sm0qlzcRyV2eKMqc',
  authDomain: 'models-789df.firebaseapp.com',
  projectId: 'models-789df',
  storageBucket: 'models-789df.appspot.com',
  messagingSenderId: '1027058117338',
  appId: '1:1027058117338:web:398cd898c0cce1aaa913e3',
  measurementId: 'G-DC11QRC5K7',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
