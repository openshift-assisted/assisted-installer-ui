export default interface Runnable {
  get isDone(): boolean;
  run(): Promise<void>;
}
