/**
 * Strapi application lifecycle hooks.
 *
 * `register`  — runs before the application is initialised (plugin registration).
 * `bootstrap` — runs after the application has initialised (good for startup tasks).
 *
 * Both functions receive the `{ strapi }` context object.
 *
 * @see https://docs.strapi.io/dev-docs/configurations/functions
 */
export default {
  /**
   * An asynchronous register function that runs before
   * your application gets registered.
   */
  register(/* { strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * Use this to set up initial data, configure plugins,
   * or run startup tasks.
   */
  bootstrap(/* { strapi } */) {},
}
