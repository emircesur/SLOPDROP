export function Ui() {
  return (
    <div>
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary" />
      <NavigationMenu.Link className="inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 text-sm font-medium transition-colors hover:bg-accent data-[state=open]:bg-accent/50 focus:outline-none focus:bg-accent" />
      <input className="w-full bg-transparent text-sm outline-none focus-within:ring-1" />
      <CommandItem className="relative flex items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent" />
      <PopoverContent className="z-50 w-72 rounded-md border bg-popover p-4 shadow-md outline-none" />
    </div>
  );
}
