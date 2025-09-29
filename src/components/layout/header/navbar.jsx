const Navbar = () => (
  <nav className="bg-white p-4 flex justify-between items-center">
    <div className="text-2xl font-bold">Exclusive</div>
    <div className="space-x-4">
      <button className="text-black hover:underline focus:outline-none">Home</button>
      <button className="text-black hover:underline focus:outline-none">Contact</button>
      <button className="text-black hover:underline focus:outline-none">About</button>
      <button className="text-black hover:underline focus:outline-none">Sign Up</button>
      <input type="text" placeholder="What are you looking for?" className="border p-1" />
    </div>
  </nav>
);

export default Navbar;