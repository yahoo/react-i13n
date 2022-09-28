export type ExecuteEvent = (name: string, payload?: any, callback?: VoidFunction) => void;

export type ContextType = {
  executeEvent: ExecuteEvent;
  i13nInstance: null;
  i13nNode: null;
  parentI13nNode: null;
};