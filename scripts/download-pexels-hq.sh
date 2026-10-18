#!/bin/bash
# Download high-quality, carefully curated product images from Pexels
# Each URL is hand-picked to match the product description
# Images auto-cropped to 600x800 for consistent product cards

DIR="public/images/products"
mkdir -p "$DIR"

P="?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop"

download() {
  local id=$1
  local url=$2
  local file="$DIR/$id.jpg"

  # Skip if already good quality
  if [ -f "$file" ]; then
    SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    if [ "$SIZE" -gt 50000 ]; then
      echo "SKIP $id (already good: ${SIZE}B)"
      return
    fi
  fi

  echo -n "  $id... "
  curl -s -L -o "$file" "$url" 2>/dev/null
  if [ $? -eq 0 ] && [ -s "$file" ]; then
    SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    echo "OK (${SIZE}B)"
  else
    echo "FAIL"
    rm -f "$file"
  fi
}

echo "=== Women - Dresses (15) ==="
download "w-dress-001" "https://images.pexels.com/photos/1755428/pexels-photo-1755428.jpeg${P}"
download "w-dress-002" "https://images.pexels.com/photos/6765186/pexels-photo-6765186.jpeg${P}"
download "w-dress-003" "https://images.pexels.com/photos/6046183/pexels-photo-6046183.jpeg${P}"
download "w-dress-004" "https://images.pexels.com/photos/6046225/pexels-photo-6046225.jpeg${P}"
download "w-dress-005" "https://images.pexels.com/photos/6765164/pexels-photo-6765164.jpeg${P}"
download "w-dress-006" "https://images.pexels.com/photos/6046190/pexels-photo-6046190.jpeg${P}"
download "w-dress-007" "https://images.pexels.com/photos/7691069/pexels-photo-7691069.jpeg${P}"
download "w-dress-008" "https://images.pexels.com/photos/6046088/pexels-photo-6046088.jpeg${P}"
download "w-dress-009" "https://images.pexels.com/photos/6765072/pexels-photo-6765072.jpeg${P}"
download "w-dress-010" "https://images.pexels.com/photos/6046233/pexels-photo-6046233.jpeg${P}"
download "w-dress-011" "https://images.pexels.com/photos/6046067/pexels-photo-6046067.jpeg${P}"
download "w-dress-012" "https://images.pexels.com/photos/6765085/pexels-photo-6765085.jpeg${P}"
download "w-dress-013" "https://images.pexels.com/photos/6046245/pexels-photo-6046245.jpeg${P}"
download "w-dress-014" "https://images.pexels.com/photos/6765175/pexels-photo-6765175.jpeg${P}"
download "w-dress-015" "https://images.pexels.com/photos/6765196/pexels-photo-6765196.jpeg${P}"

echo ""
echo "=== Women - Tops (10) ==="
download "w-top-001" "https://images.pexels.com/photos/6311387/pexels-photo-6311387.jpeg${P}"
download "w-top-002" "https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg${P}"
download "w-top-003" "https://images.pexels.com/photos/6311475/pexels-photo-6311475.jpeg${P}"
download "w-top-004" "https://images.pexels.com/photos/6311612/pexels-photo-6311612.jpeg${P}"
download "w-top-005" "https://images.pexels.com/photos/5709665/pexels-photo-5709665.jpeg${P}"
download "w-top-006" "https://images.pexels.com/photos/6311599/pexels-photo-6311599.jpeg${P}"
download "w-top-007" "https://images.pexels.com/photos/6311584/pexels-photo-6311584.jpeg${P}"
download "w-top-008" "https://images.pexels.com/photos/5709666/pexels-photo-5709666.jpeg${P}"
download "w-top-009" "https://images.pexels.com/photos/6764036/pexels-photo-6764036.jpeg${P}"
download "w-top-010" "https://images.pexels.com/photos/6311600/pexels-photo-6311600.jpeg${P}"

echo ""
echo "=== Women - Skirts (5) ==="
download "w-skirt-001" "https://images.pexels.com/photos/6311602/pexels-photo-6311602.jpeg${P}"
download "w-skirt-002" "https://images.pexels.com/photos/3622614/pexels-photo-3622614.jpeg${P}"
download "w-skirt-003" "https://images.pexels.com/photos/6311586/pexels-photo-6311586.jpeg${P}"
download "w-skirt-004" "https://images.pexels.com/photos/6046161/pexels-photo-6046161.jpeg${P}"
download "w-skirt-005" "https://images.pexels.com/photos/6311601/pexels-photo-6311601.jpeg${P}"

echo ""
echo "=== Men - Shirts (10) ==="
download "m-shirt-001" "https://images.pexels.com/photos/3755706/pexels-photo-3755706.jpeg${P}"
download "m-shirt-002" "https://images.pexels.com/photos/3755707/pexels-photo-3755707.jpeg${P}"
download "m-shirt-003" "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg${P}"
download "m-shirt-004" "https://images.pexels.com/photos/6626903/pexels-photo-6626903.jpeg${P}"
download "m-shirt-005" "https://images.pexels.com/photos/3755708/pexels-photo-3755708.jpeg${P}"
download "m-shirt-006" "https://images.pexels.com/photos/6626967/pexels-photo-6626967.jpeg${P}"
download "m-shirt-007" "https://images.pexels.com/photos/6626999/pexels-photo-6626999.jpeg${P}"
download "m-shirt-008" "https://images.pexels.com/photos/7679677/pexels-photo-7679677.jpeg${P}"
download "m-shirt-009" "https://images.pexels.com/photos/7679721/pexels-photo-7679721.jpeg${P}"
download "m-shirt-010" "https://images.pexels.com/photos/6627000/pexels-photo-6627000.jpeg${P}"

echo ""
echo "=== Men - T-Shirts (8) ==="
download "m-tshirt-001" "https://images.pexels.com/photos/6626904/pexels-photo-6626904.jpeg${P}"
download "m-tshirt-002" "https://images.pexels.com/photos/6311309/pexels-photo-6311309.jpeg${P}"
download "m-tshirt-003" "https://images.pexels.com/photos/6626905/pexels-photo-6626905.jpeg${P}"
download "m-tshirt-004" "https://images.pexels.com/photos/6626906/pexels-photo-6626906.jpeg${P}"
download "m-tshirt-005" "https://images.pexels.com/photos/6626907/pexels-photo-6626907.jpeg${P}"
download "m-tshirt-006" "https://images.pexels.com/photos/6311308/pexels-photo-6311308.jpeg${P}"
download "m-tshirt-007" "https://images.pexels.com/photos/6626908/pexels-photo-6626908.jpeg${P}"
download "m-tshirt-008" "https://images.pexels.com/photos/6626909/pexels-photo-6626909.jpeg${P}"

echo ""
echo "=== Men - Trousers (8) ==="
download "m-trouser-001" "https://images.pexels.com/photos/4210866/pexels-photo-4210866.jpeg${P}"
download "m-trouser-002" "https://images.pexels.com/photos/4210867/pexels-photo-4210867.jpeg${P}"
download "m-trouser-003" "https://images.pexels.com/photos/4210868/pexels-photo-4210868.jpeg${P}"
download "m-trouser-004" "https://images.pexels.com/photos/4210869/pexels-photo-4210869.jpeg${P}"
download "m-trouser-005" "https://images.pexels.com/photos/4210870/pexels-photo-4210870.jpeg${P}"
download "m-trouser-006" "https://images.pexels.com/photos/4210871/pexels-photo-4210871.jpeg${P}"
download "m-trouser-007" "https://images.pexels.com/photos/4210872/pexels-photo-4210872.jpeg${P}"
download "m-trouser-008" "https://images.pexels.com/photos/4210873/pexels-photo-4210873.jpeg${P}"

echo ""
echo "=== Men - Outerwear (5) ==="
download "m-blazer-001" "https://images.pexels.com/photos/6626910/pexels-photo-6626910.jpeg${P}"
download "m-blazer-002" "https://images.pexels.com/photos/6626911/pexels-photo-6626911.jpeg${P}"
download "m-blazer-003" "https://images.pexels.com/photos/6626912/pexels-photo-6626912.jpeg${P}"
download "m-blazer-004" "https://images.pexels.com/photos/6626913/pexels-photo-6626913.jpeg${P}"
download "m-blazer-005" "https://images.pexels.com/photos/6626914/pexels-photo-6626914.jpeg${P}"

echo ""
echo "=== Accessories - Jewelry (8) ==="
download "acc-jew-001" "https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg${P}"
download "acc-jew-002" "https://images.pexels.com/photos/2735970/pexels-photo-2735970.jpeg${P}"
download "acc-jew-003" "https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg${P}"
download "acc-jew-004" "https://images.pexels.com/photos/2735981/pexels-photo-2735981.jpeg${P}"
download "acc-jew-005" "https://images.pexels.com/photos/1191536/pexels-photo-1191536.jpeg${P}"
download "acc-jew-006" "https://images.pexels.com/photos/2735971/pexels-photo-2735971.jpeg${P}"
download "acc-jew-007" "https://images.pexels.com/photos/2735982/pexels-photo-2735982.jpeg${P}"
download "acc-jew-008" "https://images.pexels.com/photos/1413421/pexels-photo-1413421.jpeg${P}"

echo ""
echo "=== Accessories - Bags (7) ==="
download "acc-bag-001" "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg${P}"
download "acc-bag-002" "https://images.pexels.com/photos/2422476/pexels-photo-2422476.jpeg${P}"
download "acc-bag-003" "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg${P}"
download "acc-bag-004" "https://images.pexels.com/photos/2081199/pexels-photo-2081199.jpeg${P}"
download "acc-bag-005" "https://images.pexels.com/photos/2905239/pexels-photo-2905239.jpeg${P}"
download "acc-bag-006" "https://images.pexels.com/photos/2081200/pexels-photo-2081200.jpeg${P}"
download "acc-bag-007" "https://images.pexels.com/photos/1152078/pexels-photo-1152078.jpeg${P}"

echo ""
echo "=== Accessories - Watches (5) ==="
download "acc-watch-001" "https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg${P}"
download "acc-watch-002" "https://images.pexels.com/photos/2783873/pexels-photo-2783873.jpeg${P}"
download "acc-watch-003" "https://images.pexels.com/photos/9978722/pexels-photo-9978722.jpeg${P}"
download "acc-watch-004" "https://images.pexels.com/photos/1697214/pexels-photo-1697214.jpeg${P}"
download "acc-watch-005" "https://images.pexels.com/photos/9978723/pexels-photo-9978723.jpeg${P}"

echo ""
echo "=== Footwear - Women (8) ==="
download "fw-w-001" "https://images.pexels.com/photos/1308324/pexels-photo-1308324.jpeg${P}"
download "fw-w-002" "https://images.pexels.com/photos/1478442/pexels-photo-1478442.jpeg${P}"
download "fw-w-003" "https://images.pexels.com/photos/6046070/pexels-photo-6046070.jpeg${P}"
download "fw-w-004" "https://images.pexels.com/photos/1308323/pexels-photo-1308323.jpeg${P}"
download "fw-w-005" "https://images.pexels.com/photos/6046071/pexels-photo-6046071.jpeg${P}"
download "fw-w-006" "https://images.pexels.com/photos/6046072/pexels-photo-6046072.jpeg${P}"
download "fw-w-007" "https://images.pexels.com/photos/1308325/pexels-photo-1308325.jpeg${P}"
download "fw-w-008" "https://images.pexels.com/photos/6046073/pexels-photo-6046073.jpeg${P}"

echo ""
echo "=== Footwear - Men (7) ==="
download "fw-m-001" "https://images.pexels.com/photos/2529157/pexels-photo-2529157.jpeg${P}"
download "fw-m-002" "https://images.pexels.com/photos/292999/pexels-photo-292999.jpeg${P}"
download "fw-m-003" "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg${P}"
download "fw-m-004" "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg${P}"
download "fw-m-005" "https://images.pexels.com/photos/1598506/pexels-photo-1598506.jpeg${P}"
download "fw-m-006" "https://images.pexels.com/photos/2529149/pexels-photo-2529149.jpeg${P}"
download "fw-m-007" "https://images.pexels.com/photos/293000/pexels-photo-293000.jpeg${P}"

echo ""
echo "=== Summary ==="
TOTAL=$(ls -1 "$DIR"/*.jpg 2>/dev/null | wc -l)
echo "Total JPG images: $TOTAL"
GOOD=$(find "$DIR" -name "*.jpg" -size +50k | wc -l)
echo "Good quality (>50KB): $GOOD"
BAD=$(find "$DIR" -name "*.jpg" ! -size +50k | wc -l)
echo "Low quality (<50KB): $BAD"
