#!/bin/bash
# Download product images from Pexels (free stock photos)
# Images are cropped to 600x800 for consistent product card display

DIR="public/images/products"
mkdir -p "$DIR"

download() {
  local id=$1
  local url=$2
  local file="$DIR/$id.jpg"
  if [ -f "$file" ]; then
    echo "SKIP $id (exists)"
    return
  fi
  echo "Downloading $id..."
  curl -s -L -o "$file" "$url"
  if [ $? -eq 0 ] && [ -s "$file" ]; then
    echo "  OK $id"
  else
    echo "  FAIL $id"
    rm -f "$file"
  fi
}

P="?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop"

# ============ WOMEN — DRESSES (15) ============
download "w-dress-001" "https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg${P}"
download "w-dress-002" "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg${P}"
download "w-dress-003" "https://images.pexels.com/photos/1755428/pexels-photo-1755428.jpeg${P}"
download "w-dress-004" "https://images.pexels.com/photos/2220316/pexels-photo-2220316.jpeg${P}"
download "w-dress-005" "https://images.pexels.com/photos/2065195/pexels-photo-2065195.jpeg${P}"
download "w-dress-006" "https://images.pexels.com/photos/2220318/pexels-photo-2220318.jpeg${P}"
download "w-dress-007" "https://images.pexels.com/photos/1187813/pexels-photo-1187813.jpeg${P}"
download "w-dress-008" "https://images.pexels.com/photos/3155154/pexels-photo-3155154.jpeg${P}"
download "w-dress-009" "https://images.pexels.com/photos/2220321/pexels-photo-2220321.jpeg${P}"
download "w-dress-010" "https://images.pexels.com/photos/2229490/pexels-photo-2229490.jpeg${P}"
download "w-dress-011" "https://images.pexels.com/photos/2916814/pexels-photo-2916814.jpeg${P}"
download "w-dress-012" "https://images.pexels.com/photos/2878556/pexels-photo-2878556.jpeg${P}"
download "w-dress-013" "https://images.pexels.com/photos/2885254/pexels-photo-2885254.jpeg${P}"
download "w-dress-014" "https://images.pexels.com/photos/2065200/pexels-photo-2065200.jpeg${P}"
download "w-dress-015" "https://images.pexels.com/photos/2878557/pexels-photo-2878557.jpeg${P}"

# ============ WOMEN — TOPS (10) ============
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

# ============ WOMEN — SKIRTS (5) ============
download "w-skirt-001" "https://images.pexels.com/photos/2220317/pexels-photo-2220317.jpeg${P}"
download "w-skirt-002" "https://images.pexels.com/photos/3622614/pexels-photo-3622614.jpeg${P}"
download "w-skirt-003" "https://images.pexels.com/photos/6311586/pexels-photo-6311586.jpeg${P}"
download "w-skirt-004" "https://images.pexels.com/photos/2220315/pexels-photo-2220315.jpeg${P}"
download "w-skirt-005" "https://images.pexels.com/photos/6311601/pexels-photo-6311601.jpeg${P}"

# ============ MEN — SHIRTS (10) ============
download "m-shirt-001" "https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg${P}"
download "m-shirt-002" "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg${P}"
download "m-shirt-003" "https://images.pexels.com/photos/1192609/pexels-photo-1192609.jpeg${P}"
download "m-shirt-004" "https://images.pexels.com/photos/2897531/pexels-photo-2897531.jpeg${P}"
download "m-shirt-005" "https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg${P}"
download "m-shirt-006" "https://images.pexels.com/photos/3755706/pexels-photo-3755706.jpeg${P}"
download "m-shirt-007" "https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg${P}"
download "m-shirt-008" "https://images.pexels.com/photos/2897532/pexels-photo-2897532.jpeg${P}"
download "m-shirt-009" "https://images.pexels.com/photos/3755707/pexels-photo-3755707.jpeg${P}"
download "m-shirt-010" "https://images.pexels.com/photos/1192601/pexels-photo-1192601.jpeg${P}"

# ============ MEN — T-SHIRTS (8) ============
download "m-tshirt-001" "https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg${P}"
download "m-tshirt-002" "https://images.pexels.com/photos/6626903/pexels-photo-6626903.jpeg${P}"
download "m-tshirt-003" "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg${P}"
download "m-tshirt-004" "https://images.pexels.com/photos/6626967/pexels-photo-6626967.jpeg${P}"
download "m-tshirt-005" "https://images.pexels.com/photos/6626999/pexels-photo-6626999.jpeg${P}"
download "m-tshirt-006" "https://images.pexels.com/photos/1656685/pexels-photo-1656685.jpeg${P}"
download "m-tshirt-007" "https://images.pexels.com/photos/6627000/pexels-photo-6627000.jpeg${P}"
download "m-tshirt-008" "https://images.pexels.com/photos/6626904/pexels-photo-6626904.jpeg${P}"

# ============ MEN — TROUSERS (8) ============
download "m-trouser-001" "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg${P}"
download "m-trouser-002" "https://images.pexels.com/photos/4210866/pexels-photo-4210866.jpeg${P}"
download "m-trouser-003" "https://images.pexels.com/photos/3755708/pexels-photo-3755708.jpeg${P}"
download "m-trouser-004" "https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg${P}"
download "m-trouser-005" "https://images.pexels.com/photos/4210867/pexels-photo-4210867.jpeg${P}"
download "m-trouser-006" "https://images.pexels.com/photos/6626905/pexels-photo-6626905.jpeg${P}"
download "m-trouser-007" "https://images.pexels.com/photos/1598509/pexels-photo-1598509.jpeg${P}"
download "m-trouser-008" "https://images.pexels.com/photos/4210868/pexels-photo-4210868.jpeg${P}"

# ============ MEN — BLAZERS (5) ============
download "m-blazer-001" "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg${P}"
download "m-blazer-002" "https://images.pexels.com/photos/2897533/pexels-photo-2897533.jpeg${P}"
download "m-blazer-003" "https://images.pexels.com/photos/1043475/pexels-photo-1043475.jpeg${P}"
download "m-blazer-004" "https://images.pexels.com/photos/2955375/pexels-photo-2955375.jpeg${P}"
download "m-blazer-005" "https://images.pexels.com/photos/6626906/pexels-photo-6626906.jpeg${P}"

# ============ ACCESSORIES — JEWELRY (8) ============
download "acc-jew-001" "https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg${P}"
download "acc-jew-002" "https://images.pexels.com/photos/2735970/pexels-photo-2735970.jpeg${P}"
download "acc-jew-003" "https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg${P}"
download "acc-jew-004" "https://images.pexels.com/photos/2735981/pexels-photo-2735981.jpeg${P}"
download "acc-jew-005" "https://images.pexels.com/photos/1191536/pexels-photo-1191536.jpeg${P}"
download "acc-jew-006" "https://images.pexels.com/photos/2735971/pexels-photo-2735971.jpeg${P}"
download "acc-jew-007" "https://images.pexels.com/photos/2735982/pexels-photo-2735982.jpeg${P}"
download "acc-jew-008" "https://images.pexels.com/photos/1413421/pexels-photo-1413421.jpeg${P}"

# ============ ACCESSORIES — BAGS (7) ============
download "acc-bag-001" "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg${P}"
download "acc-bag-002" "https://images.pexels.com/photos/2081199/pexels-photo-2081199.jpeg${P}"
download "acc-bag-003" "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg${P}"
download "acc-bag-004" "https://images.pexels.com/photos/1152078/pexels-photo-1152078.jpeg${P}"
download "acc-bag-005" "https://images.pexels.com/photos/2081200/pexels-photo-2081200.jpeg${P}"
download "acc-bag-006" "https://images.pexels.com/photos/2905239/pexels-photo-2905239.jpeg${P}"
download "acc-bag-007" "https://images.pexels.com/photos/2422476/pexels-photo-2422476.jpeg${P}"

# ============ ACCESSORIES — WATCHES & SUNGLASSES (5) ============
download "acc-watch-001" "https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg${P}"
download "acc-watch-002" "https://images.pexels.com/photos/2783873/pexels-photo-2783873.jpeg${P}"
download "acc-sun-001" "https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg${P}"
download "acc-sun-002" "https://images.pexels.com/photos/1362558/pexels-photo-1362558.jpeg${P}"
download "acc-sun-003" "https://images.pexels.com/photos/701878/pexels-photo-701878.jpeg${P}"

# ============ FOOTWEAR — WOMEN (8) ============
download "fw-w-001" "https://images.pexels.com/photos/1308324/pexels-photo-1308324.jpeg${P}"
download "fw-w-002" "https://images.pexels.com/photos/1308323/pexels-photo-1308323.jpeg${P}"
download "fw-w-003" "https://images.pexels.com/photos/1478442/pexels-photo-1478442.jpeg${P}"
download "fw-w-004" "https://images.pexels.com/photos/1308325/pexels-photo-1308325.jpeg${P}"
download "fw-w-005" "https://images.pexels.com/photos/2529157/pexels-photo-2529157.jpeg${P}"
download "fw-w-006" "https://images.pexels.com/photos/1308326/pexels-photo-1308326.jpeg${P}"
download "fw-w-007" "https://images.pexels.com/photos/1308327/pexels-photo-1308327.jpeg${P}"
download "fw-w-008" "https://images.pexels.com/photos/2529158/pexels-photo-2529158.jpeg${P}"

# ============ FOOTWEAR — MEN (7) ============
download "fw-m-001" "https://images.pexels.com/photos/292999/pexels-photo-292999.jpeg${P}"
download "fw-m-002" "https://images.pexels.com/photos/293000/pexels-photo-293000.jpeg${P}"
download "fw-m-003" "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg${P}"
download "fw-m-004" "https://images.pexels.com/photos/293001/pexels-photo-293001.jpeg${P}"
download "fw-m-005" "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg${P}"
download "fw-m-006" "https://images.pexels.com/photos/2529149/pexels-photo-2529149.jpeg${P}"
download "fw-m-007" "https://images.pexels.com/photos/1598506/pexels-photo-1598506.jpeg${P}"

echo ""
echo "=== Done ==="
TOTAL=$(ls -1 "$DIR"/*.jpg 2>/dev/null | wc -l)
echo "Total JPG images: $TOTAL"
