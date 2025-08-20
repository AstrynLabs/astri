export interface Buildable<T> {
  build(): T;
}

export interface ComponentBuilderBuildable<T> {
  size: number;
  built: T;
}
