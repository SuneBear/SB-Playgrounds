export default function waitForSingleton(world, Tag, setup) {
  const state = world.listen(Tag);
  let hasInit = false;
  let hasWarned = false;
  return (dt) => {
    if (hasInit) return hasInit;
    state.added.forEach((e) => {
      if (hasInit) {
        if (!hasWarned) {
          console.error(
            `Warning: More than one EnvironmentState found on ` +
              world.system.name
          );
        }
        hasWarned = true;
        return;
      }
      const data = e.get(Tag);
      setup(data);
      hasInit = true;
    });
    return hasInit;
  };
}
