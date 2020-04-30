import * as Google from "expo-google-app-auth";
import * as React from "react";
import { Button } from "react-native";

export default function GoogleSignIn({ saveResult }) {
  console.log(saveResult);
  const signInWithGoogleAsync = async saveResult => {
    try {
      const result = await Google.logInAsync({
        //clientId - I created for this demo we will also need one for iOS and maybe web
        androidClientId:
          "316292294133-l6qn65nev8f8iu3urat9siiktoulkv9g.apps.googleusercontent.com",
        iosClientId:
          "316292294133-u4ee3q3dhh3lofeuqpk7dslnqgm3u2hq.apps.googleusercontent.com",
        expoClientId:
          "316292294133-6080ebpjivneq4cuoclvl2lncbi6gsno.apps.googleusercontent.com",
        scopes: [
          "profile",
          "email",
          "https://www.googleapis.com/auth/drive",
          "https://www.googleapis.com/auth/drive.appdata",
          "https://www.googleapis.com/auth/drive.file",
          "https://www.googleapis.com/auth/drive.metadata",
          "https://www.googleapis.com/auth/drive.metadata.readonly",
          "https://www.googleapis.com/auth/drive.photos.readonly",
          "https://www.googleapis.com/auth/drive.readonly",
          "https://www.googleapis.com/auth/photoslibrary"
        ]
      });
      if (result.type === "success") {
        //use callback if saveResult is deinfed
        return saveResult
          ? await saveResult(result.accessToken, result.refreshToken)
          : null;
      } else {
        return { cancelled: true };
      }
    } catch (e) {
      return { error: true };
    }
  };

  return (
    <Button
      title="Sign In"
      color="#f194ff"
      onPress={() => signInWithGoogleAsync(saveResult)}
    ></Button>
  );
}
