/* eslint-disable @typescript-eslint/no-explicit-any */

import { initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import Logger from "@/lib/logger";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const mainCollectionName = process.env.NEXT_PUBLIC_FIREBASE_MAIN_COLLECTION_NAME as string;

export class DataBaseController {
  static getCleanData = (firebaseData: any) => {
    const cleanData = {} as any;

    Object.entries(firebaseData).forEach(([key, value]: any) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([valueKey, valueValue]: any) => {
          switch (valueKey) {
            case 'arrayValue':
              cleanData[key] = valueValue.values.map((data: any) => {
                if (data?.mapValue?.fields) {
                  return this.getCleanData(data.mapValue.fields);
                }

                return this.getCleanData(data);
              });
              break;
            case 'mapValue':
            case 'fields':
              cleanData[key] = { ...cleanData[key], ...this.getCleanData(value[valueKey]) };
              break;
            case 'stringValue':
              cleanData[key] = valueValue;
              break;
            default:
              cleanData[key][valueKey] = valueValue;
          }
        })
      } else {
        cleanData[key] = value;
      }
    });

    return cleanData;
  }

  static read = async (storageName: string, collectionName = mainCollectionName) => {
    try {
      const docRef = doc(db, collectionName, storageName);
      const docData = await getDoc(docRef) as any;

      if (!docData.exists()) return null;

      const {
        _document: {
          data: {
            value: {
              mapValue: {
                fields = {},
              } = {},
            } = {},
          } = {},
        } = {},
      } = docData;

      return this.getCleanData(fields);
    } catch (e) {
      Logger.warn('XXX DataBaseController.read:', e);
      return null;
    }
  };

  static update = async (data: object, storageName: string, collectionName = mainCollectionName) => {
    try {
      await setDoc(
        doc(db, collectionName, storageName),
        data,
      );

      return true;
    } catch (e) {
      Logger.warn('XXX DataBaseController.update:', e);
      return false;
    }
  };
}

export default DataBaseController;
