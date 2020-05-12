import { faGamepad, faCode } from "@fortawesome/free-solid-svg-icons";
export const getSocketUrl = () => {
    if(window.location.href.includes('localhost')){
        return "http://localhost:4000/"; //When in local PORT is 4000 for Node Server
    }
    else{
        return '/';
    }
}

export const getIconNameFromString = (iconName) => {
    switch (iconName) {
      case "faCode": return faCode;
      case "faGamepad": return faGamepad;
      default: return faGamepad;
    }
}