import { setupWindow } from "./window";
import { setupView } from './view';

export const setupIpc = () => {
  setupWindow();
  setupView();
}