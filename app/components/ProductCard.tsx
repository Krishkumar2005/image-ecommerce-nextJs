import React from 'react'
import { IMAGE_VARIANTS, IProduct } from "@/models/Product"
import Link from 'next/link';
import { Image } from '@imagekit/next';
import { Eye } from 'lucide-react';

interface IProductCardProps {
  product: IProduct;
}
function ProductCard({ product }: { product: IProduct }) {
  const lowestPrice = product.variants.reduce(
    (min, variant) => (variant.price < min ? variant.price : min),
    product.variants[0]?.price || 0 // initial value of accumulator(min)
  );
  console.log("ProductCard rendered for:", product.name);
  console.log("Lowest price calculated:", lowestPrice);
  return (
    <div className="card bg-base-100 shadow hover:shadow-lg transition-all duration-300">
      <figure className="relative px-4 pt-4">
        <Link
          href={`/products/${product._id}`}
          className="relative group w-full">
          <div className="rounded-xl overflow-hidden relative w-full"
            style={{
              aspectRatio:
                IMAGE_VARIANTS.SQUARE.dimensions.width /
                IMAGE_VARIANTS.SQUARE.dimensions.height,
            }}
          >
            <Image
              urlEndpoint={process.env.NEXT_PUBLIC_URL_ENDPOINT}
              src={product.imageUrl}
              alt={product.name}
              width={IMAGE_VARIANTS.SQUARE.dimensions.width}
              height={IMAGE_VARIANTS.SQUARE.dimensions.height}
              transformation={
                [{
                  width:IMAGE_VARIANTS.SQUARE.dimensions.width,
                  height: IMAGE_VARIANTS.SQUARE.dimensions.height,
                  
                }
                ]
              }
              
              className='absolute inset-0 w-full h-full object-cover group-hover:Scale-105 transition-transform duration-500'
            />
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-xl" />
        </Link>
      </figure>
      <div className='card-body p-4'>
        <Link href={`/product/${product._id}`}
          className='hover:opacity-80 transition-opacity'>
          <h2 className='card-title text-lg'>{product.name}</h2>
        </Link>
        <p className="text-sm text-base-content/70 line-clamp-2 min-h-[2.5rem]">
          {product.description}
        </p>
        <div className='card-actions justify-between items-center mt-2'>
          <div className='flex flex-col'>
            <span className='text-lg font-bold'>From ${lowestPrice.toFixed(2)}</span> {/*fixed up to 2 decimal and convert in string */}
            <span className='text-xs text-base-content/50'>{product.variants.length} Sizes Available</span>
          </div>

          <Link href={`/products/${product._id}`} className='btn btn-primary btn-sm gap-2'>
            <Eye className='w-4 h-4' />
            View options
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProductCard