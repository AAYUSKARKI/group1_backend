import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Defaults to system, or pulls from localStorage if available
  mode: localStorage.getItem("ui-theme") || "system", 
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action) => {
      const theme = action.payload; // "light" | "dark" | "system"
      state.mode = theme;
      localStorage.setItem("ui-theme", theme);
      
      // Update the DOM immediately for instant visual feedback
      updateThemeClass(theme);
    },
  },
});

/**
 * Helper function to handle the actual CSS class switching on the <html> element
 */
export const updateThemeClass = (theme) => {
  const root = window.document.documentElement;
  root.classList.remove("light", "dark");

  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
};

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;