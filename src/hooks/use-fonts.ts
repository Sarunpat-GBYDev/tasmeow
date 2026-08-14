import {
  Prompt_400Regular,
  Prompt_500Medium,
  Prompt_600SemiBold,
  Prompt_700Bold,
  useFonts,
} from "@expo-google-fonts/prompt";

export function useAppFonts() {
  const [fontsLoaded] = useFonts({
    Prompt_400Regular,
    Prompt_500Medium,
    Prompt_600SemiBold,
    Prompt_700Bold,
  });
  return fontsLoaded;
}
