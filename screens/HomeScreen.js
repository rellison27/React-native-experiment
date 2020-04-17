import * as React from "react";
import { Image, Platform, StyleSheet, View, Button } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { AsyncStorage } from "react-native";
// TODO: we could use the rest of these ClientId's
// const config = {
//   expoClientId: `<YOUR_WEB_CLIENT_ID>`,
//   iosClientId: `<YOUR_IOS_CLIENT_ID>`,
//   androidClientId: `<YOUR_ANDROID_CLIENT_ID>`,
//   iosStandaloneAppClientId: `<YOUR_IOS_CLIENT_ID>`,
//   androidStandaloneAppClientId: `<YOUR_ANDROID_CLIENT_ID>`,
// };
import * as Google from "expo-google-app-auth";
export default function HomeScreen() {
  const [image, onImageSrc] = React.useState(" ");
  const signInWithGoogleAsync = async () => {
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
        //store to local storage to make more api calls w/o forcing user to sign in again
        return await AsyncStorage.multiSet([
          ["@access_Token", result.accessToken],
          ["@refresh_Token", result.refreshToken]
        ]);
      } else {
        return { cancelled: true };
      }
    } catch (e) {
      return { error: true };
    }
  };

  const refreshAccess = async () => {
    const refreshToken = await AsyncStorage.getItem("@refresh_Token");
    fetch(
      `https://oauth2.googleapis.com/token?client_id=316292294133-l6qn65nev8f8iu3urat9siiktoulkv9g.apps.googleusercontent.com&refresh_token=${refreshToken}&grant_type=refresh_token`,
      {
        method: "POST"
      }
    )
      .then(response => {
        if (!response.ok) {
          throw new Error("Sign In Again");
        }
        return response.json();
      })
      .then(async data => {
        await AsyncStorage.setItem("@access_Token", data.access_token);
        getAPI();
      });
  };

  const getAPI = async () => {
    const accessToken = await AsyncStorage.getItem("@access_Token");
    // get one photo via pageSize query param
    fetch(`https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=1`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      // TODO: will need a call to drive after saving our info
      // fetch(
      //   "https://www.googleapis.com/drive/v2/files/1tc24qyh-ci_zEmSD10DBBMewCs0aPw1L",
      //   {
      //     headers: { Authorization: `Bearer ${accessToken}` }
      //   }
      // )

      // if the response comes back Unauthenticated refresh accessToken
      .then(response => {
        if (response.status === 401) {
          refreshAccess();
        }
        return response.json();
      })
      // store nextPageToken to get next batch for image picker
      .then(async data => {
        await AsyncStorage.setItem("@next_Page_Token", data.nextPageToken);
        // store only photos
        onImageSrc(data.mediaItems.filter(value => value.mediaMetadata.photo));
      });
  };

  const getNextBatch = async () => {
    const accessToken = await AsyncStorage.getItem("@access_Token");
    const nextPageToken = await AsyncStorage.getItem("@next_Page_Token");
    // get one photo via pageSize query param -- this time get the next photo in the array
    fetch(
      `https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=1&pageToken=${nextPageToken}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    )
      .then(response => {
        return response.json();
      })
      // store nextPageToken to get next batch for image picker
      .then(async data => {
        await AsyncStorage.setItem("@next_Page_Token", data.nextPageToken);
        onImageSrc(data.mediaItems.filter(value => value.mediaMetadata.photo));
      });
  };
  let Image_Http_URL = {
    uri: image[0].baseUrl
  };
  console.log(image[0].baseUrl);
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.welcomeContainer}>
          {/* {image && ( */}
          <Image source={Image_Http_URL} style={styles.welcomeImage} />
          {/* )} */}
        </View>
        <View style={styles.helpContainer}>
          <View style={styles.button}>
            <View style={{ paddingBottom: 10 }}>
              <Button
                title="Sign In"
                color="#f194ff"
                onPress={() => signInWithGoogleAsync()}
              ></Button>
            </View>
            <Button
              title="Retrieve Photo"
              color="#f194ff"
              onPress={() => getAPI()}
            ></Button>
            <View style={{ paddingTop: 10 }}>
              <Button
                title="Next Photo"
                color="#f194ff"
                onPress={() => getNextBatch()}
              ></Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

HomeScreen.navigationOptions = {
  header: null
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  developmentModeText: {
    marginBottom: 20,
    color: "rgba(0,0,0,0.4)",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center"
  },
  contentContainer: {
    paddingTop: 30
  },
  welcomeContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20
  },
  welcomeImage: {
    width: 150,
    height: 150,
    // resizeMode: "contain",
    marginTop: 3,
    marginLeft: -10
  },
  getStartedContainer: {
    alignItems: "center",
    marginHorizontal: 50
  },
  homeScreenFilename: {
    marginVertical: 7
  },
  codeHighlightText: {
    color: "rgba(96,100,109, 0.8)"
  },
  codeHighlightContainer: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 3,
    paddingHorizontal: 4
  },
  getStartedText: {
    fontSize: 17,
    color: "rgba(96,100,109, 1)",
    lineHeight: 24,
    textAlign: "center"
  },
  tabBarInfoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3
      },
      android: {
        elevation: 20
      }
    }),
    alignItems: "center",
    backgroundColor: "#fbfbfb",
    paddingVertical: 20
  },
  tabBarInfoText: {
    fontSize: 17,
    color: "rgba(96,100,109, 1)",
    textAlign: "center"
  },
  navigationFilename: {
    marginTop: 5
  },
  helpContainer: {
    marginTop: 15,
    alignItems: "center"
  },
  helpLink: {
    paddingVertical: 15
  },
  helpLinkText: {
    fontSize: 14,
    color: "#2e78b7"
  },
  button: {
    paddingTop: "10%",
    width: "60%"
  }
});
