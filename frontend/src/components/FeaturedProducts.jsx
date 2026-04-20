import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";

const FeaturedProducts = ({ featuredProducts }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(4);
    
    const { addToCart } = useCartStore();

    useEffect(() => {
        const handleResize = () => {
            if(window.innerWidth < 640) setItemsPerPage(1);
            else if(window.innerWidth < 1024) setItemsPerPage(2);
            else if (window.innerWidth < 1280) setItemsPerPage(3);
            else setItemsPerPage(4);
        }

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const nextSlide = () => {
        if (featuredProducts.length <= itemsPerPage) return;
        setCurrentIndex((prevIndex) => {
            const isAtEnd = prevIndex >= featuredProducts.length - itemsPerPage;
            return isAtEnd ? 0 : prevIndex + 1;
        } )
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => {
            const isAtStart = prevIndex === 0 ;
            return isAtStart ? featuredProducts.length - itemsPerPage : prevIndex - 1;
        })
    };
    
    return (
        <div className="py-12">
            <div className="container mx-auto px-4">
                <h2 className="text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4">Featured</h2>
                <div className="relative">
                    <div className="overflow-hidden">
                        <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}>
                            
                            {featuredProducts?.map((product) => (
                               <div key={product._id} className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 flex-shrink-0 px-2">
                                    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden h-full transition-all duration-300 hover:shadow-lg border border-emerald-500/30">
                                        <div className="overflow-hidden">
                                            <img src={product.image} alt={product.name} className="w-full h-48 object-cover transition-transform duration-300 ease-in-out hover:scale-110" />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold mb-2 text-white">{product.name}</h3>
                                            <p className="text-emerald-300 font-medium mb-4">${product.price.toFixed(2)}</p>
                                            <button
                                                onClick={() => addToCart(product)}
                                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded transition-colors duration-300 flex items-center justify-center"
                                            >
                                                <ShoppingCart className="w-5 h-5 mr-2" />
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                               </div>
                            ))}
                        </div>
                    </div>
                    {featuredProducts.length > itemsPerPage && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-2 rounded-full transition-colors duration-300"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-2 rounded-full transition-colors duration-300"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
};
export default FeaturedProducts;