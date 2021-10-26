/* eslint-disable @typescript-eslint/no-explicit-any */

[
    (require as any).context('./', true, /\.spec\.ts$/), // includes all specs
    (require as any).context('./app', true, /\.ts$/), // modify path to root folder of code you want to test (app for example in angular apps)
    // add more paths here to ensure that all code is considered for coverage
].forEach((context) => context.keys().map(context));
