#!/bin/bash
# Download high-quality product images from Unsplash Source (free, no API key needed)
# Images are resized to 600x800 for consistent product card display

DIR="public/images/products"
mkdir -p "$DIR"

download() {
  local id=$1
  local query=$2
  local file="$DIR/$id.jpg"

  # Skip if already have a good quality image (>50KB)
  if [ -f "$file" ] && [ $(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null) -gt 50000 ]; then
    echo "SKIP $id (already good)"
    return
  fi

  echo "Downloading $id ($query)..."
  # Unsplash Source API - free, no key needed, returns random matching photo
  curl -s -L -o "$file" "https://source.unsplash.com/600x800/?${query}" 2>/dev/null

  if [ $? -eq 0 ] && [ -s "$file" ]; then
    SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    if [ "$SIZE" -gt 10000 ]; then
      echo "  OK $id (${SIZE} bytes)"
    else
      echo "  TOO SMALL $id"
      rm -f "$file"
    fi
  else
    echo "  FAIL $id"
    rm -f "$file"
  fi
  sleep 1
}

# ============ WOMEN — DRESSES (15) ============
download "w-dress-001" "purple,dress,fashion"
download "w-dress-002" "pink,dress,fashion"
download "w-dress-003" "black,dress,fashion,printed"
download "w-dress-004" "grey,red,dress,fashion"
download "w-dress-005" "orange,floral,dress"
download "w-dress-006" "blue,polka,dot,dress"
download "w-dress-007" "brown,animal,print,dress"
download "w-dress-008" "black,wrap,dress"
download "w-dress-009" "colorful,printed,dress"
download "w-dress-010" "black,shift,dress,minimal"
download "w-dress-011" "white,sleeveless,dress"
download "w-dress-012" "orange,midi,dress"
download "w-dress-013" "grey,black,dress"
download "w-dress-014" "pink,black,printed,dress"
download "w-dress-015" "pink,midi,dress,feminine"

# ============ WOMEN — TOPS (10) ============
download "w-top-001" "mauve,womens,top,fashion"
download "w-top-002" "striped,navy,cream,top,women"
download "w-top-003" "blue,vneck,blouse,women"
download "w-top-004" "white,colorful,top,women"
download "w-top-005" "black,animal,print,top"
download "w-top-006" "blue,smock,top,women"
download "w-top-007" "blue,tunic,women"
download "w-top-008" "green,top,women,casual"
download "w-top-009" "floral,multicolor,top,women"
download "w-top-010" "blue,sequin,top,women"

# ============ WOMEN — SKIRTS (5) ============
download "w-skirt-001" "brown,skirt,women"
download "w-skirt-002" "blue,athletic,skirt"
download "w-skirt-003" "pink,pleated,skirt"
download "w-skirt-004" "black,printed,skirt"
download "w-skirt-005" "black,athletic,skirt"

# ============ MEN — SHIRTS (10) ============
download "m-shirt-001" "blue,plaid,mens,shirt"
download "m-shirt-002" "checked,mens,shirt"
download "m-shirt-003" "green,checked,shirt,men"
download "m-shirt-004" "red,black,flannel,shirt"
download "m-shirt-005" "purple,dress,shirt,men"
download "m-shirt-006" "dark,checked,shirt,men"
download "m-shirt-007" "purple,checked,casual,shirt"
download "m-shirt-008" "blue,brown,plaid,shirt"
download "m-shirt-009" "green,striped,formal,shirt"
download "m-shirt-010" "black,dress,shirt,men"

# ============ MEN — T-SHIRTS (8) ============
download "m-tshirt-001" "navy,striped,polo,shirt"
download "m-tshirt-002" "pink,polo,shirt,men"
download "m-tshirt-003" "red,polo,shirt,men"
download "m-tshirt-004" "grey,striped,tshirt,men"
download "m-tshirt-005" "charcoal,graphic,tshirt"
download "m-tshirt-006" "blue,polo,shirt"
download "m-tshirt-007" "blue,graphic,tshirt,men"
download "m-tshirt-008" "red,sports,tshirt,athletic"

# ============ MEN — TROUSERS (8) ============
download "m-trouser-001" "beige,formal,trousers,men"
download "m-trouser-002" "black,jeans,men"
download "m-trouser-003" "blue,jeans,denim"
download "m-trouser-004" "navy,blue,trousers,formal"
download "m-trouser-005" "black,slim,jeans"
download "m-trouser-006" "navy,chinos,men"
download "m-trouser-007" "blue,skinny,jeans"
download "m-trouser-008" "blue,casual,trousers"

# ============ MEN — OUTERWEAR (5) ============
download "m-blazer-001" "green,sweatshirt,men"
download "m-blazer-002" "blue,windbreaker,jacket"
download "m-blazer-003" "navy,striped,sweater,men"
download "m-blazer-004" "grey,sweatshirt,men"
download "m-blazer-005" "white,printed,sweatshirt"

# ============ ACCESSORIES — JEWELRY (8) ============
download "acc-jew-001" "gold,statement,necklace"
download "acc-jew-002" "coral,red,beaded,necklace"
download "acc-jew-003" "blue,pendant,necklace"
download "acc-jew-004" "pink,drop,earrings"
download "acc-jew-005" "silver,beaded,necklace"
download "acc-jew-006" "red,drop,earrings"
download "acc-jew-007" "green,emerald,earrings"
download "acc-jew-008" "silver,ornate,earrings"

# ============ ACCESSORIES — BAGS (7) ============
download "acc-bag-001" "blue,backpack,sporty"
download "acc-bag-002" "black,backpack"
download "acc-bag-003" "red,leather,handbag"
download "acc-bag-004" "black,leather,handbag"
download "acc-bag-005" "black,laptop,bag"
download "acc-bag-006" "orange,backpack,colorful"
download "acc-bag-007" "white,leather,handbag"

# ============ ACCESSORIES — WATCHES (5) ============
download "acc-watch-001" "silver,chronograph,watch,men"
download "acc-watch-002" "white,dial,watch,women"
download "acc-watch-003" "black,dial,watch,women"
download "acc-watch-004" "white,dress,watch,elegant"
download "acc-watch-005" "black,statement,watch"

# ============ FOOTWEAR — WOMEN (8) ============
download "fw-w-001" "brown,leather,heels,women"
download "fw-w-002" "yellow,strappy,sandals"
download "fw-w-003" "red,moccasin,loafer,shoes"
download "fw-w-004" "bronze,metallic,heels"
download "fw-w-005" "gold,metallic,heels"
download "fw-w-006" "beige,nude,flat,shoes"
download "fw-w-007" "red,strappy,heels"
download "fw-w-008" "silver,grey,heels"

# ============ FOOTWEAR — MEN (7) ============
download "fw-m-001" "white,sneakers,athletic"
download "fw-m-002" "black,casual,leather,shoes"
download "fw-m-003" "grey,running,shoes"
download "fw-m-004" "red,slide,sandals,sport"
download "fw-m-005" "navy,blue,high,top,sneakers"
download "fw-m-006" "olive,outdoor,sandals"
download "fw-m-007" "navy,leather,casual,shoes"

echo ""
echo "=== Done ==="
TOTAL=$(ls -1 "$DIR"/*.jpg 2>/dev/null | wc -l)
echo "Total JPG images: $TOTAL"
GOOD=$(find "$DIR" -name "*.jpg" -size +50k | wc -l)
echo "Good quality (>50KB): $GOOD"
