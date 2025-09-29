import React from "react";

const defaultProducts = [
	{
		id: 1,
		name: "PlayStation 5",
		image: "https://m.media-amazon.com/images/I/61nCqYb1c+L._AC_SL1500_.jpg",
		description: "Black and White version of the PS5 coming out on sale.",
		buttonText: "Shop Now",
	},
	{
		id: 2,
		name: "Women's Collections",
		image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
		description: "Featured woman collections that give you another vibe.",
		buttonText: "Shop Now",
	},
	{
		id: 3,
		name: "Speakers",
		image: "https://m.media-amazon.com/images/I/71QKQwQdKDL._AC_UL1500_.jpg",
		description: "Amazon wireless speakers.",
		buttonText: "Shop Now",
	},
	{
		id: 4,
		name: "Perfume",
		image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
		description: "GUCCI INTENSE OUD EDP.",
		buttonText: "Shop Now",
	},
];

const NewArrivalSection = ({ products = defaultProducts, onShopClick }) => {
	return (
		<section className="bg-white rounded-xl shadow p-6 md:p-10 mb-8">
			{/* Label + Title */}
			<div className="mb-6">
				<div className="flex items-center mb-2">
					<span className="bg-red-500 rounded h-6 w-4 mr-2"></span>
					<span className="text-red-500 font-bold text-lg">Featured</span>
				</div>
				<h2 className="font-bold text-black text-3xl mt-2">New Arrival</h2>
			</div>
			{/* Product cards grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-6">
				{/* Big left card */}
				<div className="relative col-span-1 md:row-span-2 md:col-span-1 bg-black rounded-lg overflow-hidden flex items-end min-h-[340px]">
					<img
						src={products[0].image}
						alt={products[0].name}
						className="absolute inset-0 w-full h-full object-cover opacity-80"
					/>
					<div className="relative z-10 p-8">
						<div className="font-bold text-white text-xl mb-2">
							{products[0].name}
						</div>
						<div className="text-gray-200 text-base mb-4">
							{products[0].description}
						</div>
						<button
							className="bg-transparent text-white font-semibold underline underline-offset-2"
							onClick={() => onShopClick && onShopClick(products[0])}
						>
							{products[0].buttonText}
						</button>
					</div>
				</div>
				{/* Top right card */}
				<div className="relative bg-black rounded-lg overflow-hidden flex items-end min-h-[160px]">
					<img
						src={products[1].image}
						alt={products[1].name}
						className="absolute inset-0 w-full h-full object-cover opacity-80"
					/>
					<div className="relative z-10 p-6">
						<div className="font-bold text-white text-lg mb-2">
							{products[1].name}
						</div>
						<div className="text-gray-200 text-sm mb-4">
							{products[1].description}
						</div>
						<button
							className="bg-transparent text-white font-semibold underline underline-offset-2"
							onClick={() => onShopClick && onShopClick(products[1])}
						>
							{products[1].buttonText}
						</button>
					</div>
				</div>
				{/* Bottom right cards */}
				<div className="grid grid-cols-2 gap-6">
					{[products[2], products[3]].map((product) => (
						<div
							key={product.id}
							className="relative bg-black rounded-lg overflow-hidden flex items-end min-h-[160px]"
						>
							<img
								src={product.image}
								alt={product.name}
								className="absolute inset-0 w-full h-full object-cover opacity-80"
							/>
							<div className="relative z-10 p-6">
								<div className="font-bold text-white text-lg mb-2">
									{product.name}
								</div>
								<div className="text-gray-200 text-sm mb-4">
									{product.description}
								</div>
								<button
									className="bg-transparent text-white font-semibold underline underline-offset-2"
									onClick={() => onShopClick && onShopClick(product)}
								>
									{product.buttonText}
								</button>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default NewArrivalSection;