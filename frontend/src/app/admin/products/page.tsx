"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/backend/authService";
import { sellerService, Seller } from "@/backend/sellerService";
import { productService, Product, type ProductVariant, type ProductVariantOption } from "@/backend/productService";
import { parseProductImg } from "@/lib/productUi";
import { supabase } from "@/backend/supabase";

export default function AdminProductsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [categories, setCategories] = useState<{ id_kategori: string; nama_kategori: string }[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");
  const [selectedSellerFilter, setSelectedSellerFilter] = useState("");

  // Modal & Edit states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProductName, setNewProductName] = useState("");
  const [newProductSellerId, setNewProductSellerId] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [newProductBrandName, setNewProductBrandName] = useState("");
  const [newProductCode, setNewProductCode] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductStock, setNewProductStock] = useState("");
  const [newProductDescription, setNewProductDescription] = useState("");
  const [newProductImages, setNewProductImages] = useState<string[]>([]);
  const [manualUrl, setManualUrl] = useState("");
  const [useManualUrl, setUseManualUrl] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const [newProductBahan, setNewProductBahan] = useState("");
  const [newProductAsal, setNewProductAsal] = useState("");
  const [newProductKetahanan, setNewProductKetahanan] = useState("");
  const [newProductInfoTambahan, setNewProductInfoTambahan] = useState("");
  const [newProductVariants, setNewProductVariants] = useState<
    { label: string; options: { name: string; image: string; price: string }[] }[]
  >([{ label: "Ukuran", options: [{ name: "", image: "", price: "" }] }]);
  const [variantUploading, setVariantUploading] = useState<string | null>(null);

  async function uploadImageFile(file: File): Promise<string> {
    if (file.size > 2 * 1024 * 1024) {
      throw new Error(`Ukuran gambar ${file.name} terlalu besar! Maksimal 2MB.`);
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
    const filePath = `product-images/${fileName}`;

    try {
      const { error } = await supabase.storage
        .from("products")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage.from("products").getPublicUrl(filePath);
      if (publicUrlData?.publicUrl) return publicUrlData.publicUrl;
      throw new Error("Gagal mendapatkan URL gambar.");
    } catch (err) {
      console.warn("Upload storage gagal, pakai base64:", err);
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve((event.target?.result as string) || "");
        reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
        reader.readAsDataURL(file);
      });
    }
  }

  function setVariantOptionImage(gIdx: number, oIdx: number, image: string) {
    setNewProductVariants((prev) => {
      const next = [...prev];
      const opts = [...next[gIdx].options];
      opts[oIdx] = { ...opts[oIdx], image };
      next[gIdx] = { ...next[gIdx], options: opts };
      return next;
    });
  }

  async function handleVariantImageUpload(
    gIdx: number,
    oIdx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    const key = `${gIdx}-${oIdx}`;
    setVariantUploading(key);
    try {
      const url = await uploadImageFile(file);
      setVariantOptionImage(gIdx, oIdx, url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengunggah foto varian.");
    } finally {
      setVariantUploading(null);
      e.target.value = "";
    }
  }

  const loadData = async () => {
    // 1. Auth check
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push("/masuk");
      return;
    }
    setUser(currentUser);

    // 2. Fetch products, categories, and sellers
    const allProducts = await productService.getProducts({ limit: 500, includeImages: true });
    setProducts(allProducts);

    const allCategories = await productService.getCategories();
    setCategories(allCategories);
    if (allCategories.length > 0) {
      setNewProductCategory(allCategories[0].id_kategori);
    }

    const allSellers = await sellerService.getSellers();
    setSellers(allSellers);
    if (allSellers.length > 0) {
      setNewProductSellerId(allSellers[0].id_seller);
      setNewProductBrandName(allSellers[0].nm_store);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update Nama Brand field automatically when Toko changes in add product modal
  useEffect(() => {
    if (newProductSellerId) {
      const selected = sellers.find(s => s.id_seller === newProductSellerId);
      if (selected) {
        setNewProductBrandName(selected.nm_store);
      }
    }
  }, [newProductSellerId, sellers]);

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
    setNewProductName("");
    setNewProductPrice("");
    setNewProductStock("");
    setNewProductDescription("");
    setNewProductImages([]);
    setManualUrl("");
    setNewProductCode("");
    setUploadProgress(null);
    setUseManualUrl(false);
    setNewProductBahan("");
    setNewProductAsal("");
    setNewProductKetahanan("");
    setNewProductInfoTambahan("");
    setNewProductVariants([{ label: "Ukuran", options: [{ name: "", image: "", price: "" }] }]);
  };

  const handleEditClick = async (p: Product) => {
    const full = await productService.getProductBySlugOrId(p.slug || p.id_produk);
    const product = (full as Product | null) || p;
    setEditingProduct(product);
    setNewProductName(product.nama_produk);
    setNewProductSellerId(product.id_seller);
    const foundCat = categories.find(c => c.nama_kategori === product.category);
    setNewProductCategory(foundCat ? foundCat.id_kategori : "");
    setNewProductBrandName(product.nama_brand || "");
    setNewProductCode(product.kode_produk || "");
    setNewProductPrice(product.harga.toString());
    setNewProductStock(product.stok.toString());
    setNewProductDescription(product.desc);
    setNewProductImages(product.images || (product.img ? [product.img] : []));
    setNewProductBahan(product.bahan || "");
    setNewProductAsal(product.asal_produk || "");
    setNewProductKetahanan(product.ketahanan || "");
    setNewProductInfoTambahan(product.info_tambahan || "");
    setNewProductVariants(
      product.variants && product.variants.length > 0
        ? product.variants.map((v) => ({
            label: v.label,
            options: v.options.map((o) => ({
              name: o.name,
              image: o.image || "",
              price: o.price != null ? String(o.price) : "",
            })),
          }))
        : [{ label: "Ukuran", options: [{ name: "", image: "", price: "" }] }]
    );
    setShowAddModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk ${name}?`)) {
      const success = await productService.deleteProduct(id);
      if (success) {
        alert(`Produk ${name} berhasil dihapus!`);
        loadData();
      } else {
        alert("Gagal menghapus produk.");
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      if (newProductImages.length + files.length > 10) {
        alert("Maksimal 10 gambar per produk.");
        return;
      }

      setUploadProgress(0);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          setUploadProgress(Math.round(((i + 1) / files.length) * 100));
          const uploadedUrl = await uploadImageFile(file);
          if (uploadedUrl) uploadedUrls.push(uploadedUrl);
        } catch (err) {
          alert(err instanceof Error ? err.message : `Gagal mengunggah ${file.name}`);
        }
      }

      setNewProductImages((prev) => [...prev, ...uploadedUrls]);
      setUploadProgress(null);
    }
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductSellerId) {
      alert("Error: Silakan pilih Toko terlebih dahulu.");
      return;
    }

    const imagesToSubmit = newProductImages.length > 0 ? newProductImages : undefined;

    const parsedVariants: ProductVariant[] = newProductVariants
      .filter((g) => g.label.trim())
      .map((g) => ({
        label: g.label.trim(),
        options: g.options
          .filter((o) => o.name.trim())
          .map((o) => {
            const opt: ProductVariantOption = { name: o.name.trim() };
            if (o.image.trim()) opt.image = o.image.trim();
            if (o.price.trim()) opt.price = parseFloat(o.price) || undefined;
            return opt;
          }),
      }))
      .filter((g) => g.options.length > 0);

    const extras = {
      bahan: newProductBahan.trim() || undefined,
      asal_produk: newProductAsal.trim() || undefined,
      ketahanan: newProductKetahanan.trim() || undefined,
      info_tambahan: newProductInfoTambahan.trim() || undefined,
      variants: parsedVariants,
    };

    if (editingProduct) {
      const success = await productService.updateProduct(
        editingProduct.id_produk,
        newProductName,
        newProductCategory || null,
        parseFloat(newProductPrice) || 0,
        parseInt(newProductStock) || 0,
        newProductDescription || "Deskripsi produk baru",
        imagesToSubmit,
        (parseInt(newProductStock) || 0) > 0 ? "Aktif" : "Stok Habis",
        newProductBrandName,
        newProductCode || undefined,
        extras
      );

      if (success) {
        alert("Produk berhasil diupdate!");
        loadData();
        handleCloseModal();
      } else {
        alert("Gagal mengupdate produk.");
      }
    } else {
      const newProduct = await productService.addProduct(
        newProductSellerId,
        newProductName,
        newProductCategory || null,
        parseFloat(newProductPrice) || 0,
        parseInt(newProductStock) || 0,
        newProductDescription || "Deskripsi produk baru",
        imagesToSubmit,
        (parseInt(newProductStock) || 0) > 0 ? "Aktif" : "Stok Habis",
        newProductBrandName,
        newProductCode || undefined,
        extras
      );

      if (newProduct) {
        alert("Produk berhasil ditambahkan!");
        loadData();
        handleCloseModal();
      } else {
        alert(
          "Gagal menambahkan produk. Pastikan toko sudah terdaftar, kategori valid, dan policy RLS di db.sql sudah dijalankan di Supabase."
        );
      }
    }
  };

  const getSellerName = (sellerId: string) => {
    const s = sellers.find((item) => item.id_seller === sellerId);
    return s ? s.nm_store : "Toko Tidak Diketahui";
  };

  // Filter products based on search term, category filter, and seller filter
  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.nama_produk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.nama_brand && p.nama_brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.kode_produk && p.kode_produk.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategoryFilter === "" || p.category === selectedCategoryFilter;
    const matchesSeller = selectedSellerFilter === "" || p.id_seller === selectedSellerFilter;

    return matchesSearch && matchesCategory && matchesSeller;
  });

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-bold text-[#1F1B18]">Manajemen Produk</h2>
          <p className="font-body text-body-md text-[#5C5550] mt-1">
            Kelola katalog produk dari seluruh mitra UMKM di satu dashboard superadmin.
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1D4ED8] text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Tambah Produk Baru
        </button>
      </header>

      {/* Metrics Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-[#EAE5E0] p-6 rounded-xl space-y-1 shadow-sm">
          <p className="text-xs uppercase font-bold text-[#8E8680] tracking-wider">Total Produk</p>
          <h3 className="font-headline text-2xl font-extrabold text-[#1F1B18]">{products.length}</h3>
        </div>
        <div className="bg-white border border-[#EAE5E0] p-6 rounded-xl space-y-1 shadow-sm">
          <p className="text-xs uppercase font-bold text-[#8E8680] tracking-wider">Aktif</p>
          <h3 className="font-headline text-2xl font-extrabold text-[#1D4ED8] flex items-center justify-between">
            {products.filter(p => p.status === "Aktif").length}
            {products.length > 0 ? (
              <span className="text-[10px] bg-green-50 border border-green-200 text-green-600 px-2 py-0.5 rounded uppercase">
                {Math.round((products.filter(p => p.status === "Aktif").length / products.length) * 100)}%
              </span>
            ) : (
              <span className="text-[10px] bg-zinc-50 border border-zinc-200 text-zinc-600 px-2 py-0.5 rounded uppercase">0%</span>
            )}
          </h3>
        </div>
        <div className="bg-white border border-[#EAE5E0] p-6 rounded-xl space-y-1 shadow-sm">
          <p className="text-xs uppercase font-bold text-[#8E8680] tracking-wider">Stok Habis</p>
          <h3 className="font-headline text-2xl font-extrabold text-red-600">
            {products.filter(p => p.stok === 0 || p.status === "Stok Habis").length}
          </h3>
        </div>
        <div className="bg-white border border-[#EAE5E0] p-6 rounded-xl space-y-1 shadow-sm">
          <p className="text-xs uppercase font-bold text-[#8E8680] tracking-wider">Toko Terdaftar</p>
          <h3 className="font-headline text-2xl font-extrabold text-[#1F1B18]">{sellers.length}</h3>
        </div>
      </section>

      {/* Filter and controls */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8680] text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Cari nama produk, SKU, brand, atau kode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 rounded border border-[#D5CFC9] bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] transition text-xs font-body text-[#1F1B18]"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select 
            value={selectedSellerFilter}
            onChange={(e) => setSelectedSellerFilter(e.target.value)}
            className="px-4 py-2.5 rounded border border-[#D5CFC9] bg-white text-xs font-semibold text-[#5C5550] focus:outline-none"
          >
            <option value="">Semua Toko</option>
            {sellers.map((s) => (
              <option key={s.id_seller} value={s.id_seller}>
                {s.nm_store}
              </option>
            ))}
          </select>
          <select 
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-4 py-2.5 rounded border border-[#D5CFC9] bg-white text-xs font-semibold text-[#5C5550] focus:outline-none"
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id_kategori} value={cat.nama_kategori}>
                {cat.nama_kategori}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Product List Table */}
      <section className="bg-white border border-[#EAE5E0] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F3F0] border-b border-[#EAE5E0]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C5550]">Info Produk</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C5550]">Toko</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C5550]">Brand (Frontend)</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C5550]">Kode Produk</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C5550]">SKU</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C5550]">Harga</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C5550]">Stok</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C5550]">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C5550] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE5E0]">
              {filteredProducts.map((p) => (
                <tr key={p.id_produk} className="hover:bg-[#F5F3F0]/30 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F5F3F0] rounded overflow-hidden flex-shrink-0 border border-[#EAE5E0]">
                        <img src={parseProductImg(p.img)} alt={p.nama_produk} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#1F1B18] leading-snug">{p.nama_produk}</p>
                        <p className="text-[10px] text-[#8E8680] font-bold mt-0.5">{p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-[#5C5550] font-semibold">{getSellerName(p.id_seller)}</td>
                  <td className="px-6 py-4 text-xs text-[#1F1B18] font-bold">{p.nama_brand || "UMKM Lokal"}</td>
                  <td className="px-6 py-4 text-xs text-[#5C5550] font-mono">{p.kode_produk || "-"}</td>
                  <td className="px-6 py-4 text-xs text-[#8E8680] font-semibold">{p.sku}</td>
                  <td className="px-6 py-4 font-bold text-sm text-[#1F1B18]">Rp {p.harga.toLocaleString("id-ID")}</td>
                  <td className="px-6 py-4 text-xs font-extrabold text-[#1F1B18]">{p.stok}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${p.status === "Aktif" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => handleEditClick(p)}
                        className="p-1.5 hover:bg-[#F5F3F0] rounded text-[#8E8680] hover:text-[#1F1B18] transition"
                        title="Edit Produk"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id_produk, p.nama_produk)}
                        className="p-1.5 hover:bg-red-50 rounded text-[#8E8680] hover:text-red-600 transition"
                        title="Hapus Produk"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#8E8680] text-sm font-medium">
                    Tidak ada produk ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 bg-[#F5F3F0]/40 border-t border-[#EAE5E0] flex items-center justify-between text-xs font-semibold text-[#8E8680]">
          <p>
            {products.length > 0 
              ? `Menampilkan 1-${filteredProducts.length} dari ${products.length} produk`
              : "Tidak ada produk"
            }
          </p>
        </div>
      </section>

      {/* Stateful Add/Edit Product Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 backdrop-blur-xs">
          <div className="bg-white border border-[#EAE5E0] rounded-xl max-w-lg w-full overflow-hidden shadow-xl animate-scale-in">
            <div className="px-6 py-4 border-b border-[#EAE5E0] flex justify-between items-center bg-[#F5F3F0]/50">
              <h3 className="font-headline font-bold text-base text-[#1F1B18]">
                {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-[#8E8680] hover:text-[#1F1B18] transition"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleAddProductSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto font-semibold text-xs text-[#5C5550]">
              <div className="space-y-1.5 text-left">
                <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">Nama Produk</label>
                <input 
                  type="text" 
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Kemeja Batik Klasik..." 
                  className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded bg-[#F5F3F0] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] text-xs font-body text-[#1F1B18]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">Toko Mitra</label>
                  <select 
                    value={newProductSellerId}
                    onChange={(e) => setNewProductSellerId(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded bg-white focus:outline-none text-xs font-semibold text-[#1F1B18]"
                  >
                    {sellers.map((s) => (
                      <option key={s.id_seller} value={s.id_seller}>
                        {s.nm_store}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">Kategori</label>
                  <select 
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded bg-white focus:outline-none text-xs font-semibold text-[#1F1B18]"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id_kategori} value={cat.id_kategori}>
                        {cat.nama_kategori}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">Nama Brand (Tampil di Web)</label>
                  <input 
                    type="text" 
                    required
                    value={newProductBrandName}
                    onChange={(e) => setNewProductBrandName(e.target.value)}
                    placeholder="Nama Brand..." 
                    className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded bg-[#F5F3F0] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] text-xs font-body text-[#1F1B18]"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">Kode Produk (Internal)</label>
                  <input 
                    type="text" 
                    value={newProductCode}
                    onChange={(e) => setNewProductCode(e.target.value)}
                    placeholder="Kosongkan untuk auto-generate" 
                    className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded bg-[#F5F3F0] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] text-xs font-body text-[#1F1B18]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">Harga (Rp)</label>
                  <input 
                    type="number" 
                    required
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    placeholder="150000" 
                    className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded bg-[#F5F3F0] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] text-xs font-body text-[#1F1B18]"
                  />
                </div>
                
                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">Jumlah Stok</label>
                  <input 
                    type="number" 
                    required
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    placeholder="10" 
                    className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded bg-[#F5F3F0] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] text-xs font-body text-[#1F1B18]"
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">Gambar Produk</label>
                
                {/* Upload progress indicator */}
                {uploadProgress !== null && (
                  <div className="w-full text-center space-y-1 p-2 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg">
                    <p className="text-[10px] font-bold text-[#1D4ED8]">Mengunggah Gambar: {uploadProgress}%</p>
                    <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#1D4ED8] transition-all duration-100" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Thumbnails grid */}
                <div className="grid grid-cols-5 gap-3 mb-2">
                  {newProductImages.map((imgUrl, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg border border-[#EAE5E0] overflow-hidden bg-[#F5F3F0] shadow-xs">
                      <img src={imgUrl} alt={`Gambar ${index + 1}`} className="w-full h-full object-cover" />
                      
                      {/* Cover / Utama Badge */}
                      {index === 0 && (
                        <span className="absolute top-1 left-1 bg-[#1D4ED8] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow">
                          Utama
                        </span>
                      )}

                      {/* Actions overlay on hover */}
                      <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity duration-150">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setNewProductImages(prev => {
                                const updated = [...prev];
                                const item = updated.splice(index, 1)[0];
                                return [item, ...updated];
                              });
                            }}
                            title="Jadikan Foto Utama"
                            className="p-1 bg-white hover:bg-blue-50 text-[#1D4ED8] rounded-full shadow-xs transition"
                          >
                            <span className="material-symbols-outlined text-[14px]">star</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setNewProductImages(prev => prev.filter((_, idx) => idx !== index));
                          }}
                          title="Hapus Gambar"
                          className="p-1 bg-white hover:bg-red-50 text-red-600 rounded-full shadow-xs transition"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Upload button slot inside grid */}
                  {newProductImages.length < 10 && !useManualUrl && (
                    <div className="relative aspect-square border border-dashed border-[#D5CFC9] rounded-lg bg-[#FCFCFA] hover:bg-[#F5F3F0]/50 hover:border-[#1D4ED8] transition flex flex-col items-center justify-center cursor-pointer text-center p-2">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        onChange={handleImageUpload}
                      />
                      <span className="material-symbols-outlined text-[#8E8680] text-[22px] mb-0.5">
                        add_photo_alternate
                      </span>
                      <p className="text-[9px] font-bold text-[#1F1B18]">Tambah Foto</p>
                      <p className="text-[7px] text-[#8E8680] mt-0.5">({newProductImages.length}/10)</p>
                    </div>
                  )}
                </div>

                {/* Manual URL Input */}
                {useManualUrl ? (
                  <div className="space-y-2 border border-[#EAE5E0] rounded-lg p-3 bg-[#FCFCFA]">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={manualUrl}
                        onChange={(e) => setManualUrl(e.target.value)}
                        placeholder="Masukkan URL gambar (https://...)" 
                        className="flex-1 px-3 py-2 border border-[#D5CFC9] rounded bg-[#F5F3F0] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] text-xs font-body text-[#1F1B18]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (manualUrl.trim()) {
                            setNewProductImages(prev => [...prev, manualUrl.trim()]);
                            setManualUrl("");
                          }
                        }}
                        className="px-3 py-2 bg-[#1D4ED8] text-white text-xs font-bold rounded hover:bg-blue-700 transition"
                      >
                        Tambah
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUseManualUrl(false)}
                      className="text-[10px] text-[#1D4ED8] font-bold hover:underline"
                    >
                      ← Gunakan Pengunggah File
                    </button>
                  </div>
                ) : (
                  newProductImages.length < 10 && (
                    <button
                      type="button"
                      onClick={() => setUseManualUrl(true)}
                      className="text-[10px] text-[#8E8680] font-semibold hover:underline mt-1"
                    >
                      Masukkan URL Gambar Secara Manual
                    </button>
                  )
                )}
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-[11px] uppercase tracking-wider text-[#8E8680]">Deskripsi Produk</label>
                <textarea 
                  required
                  rows={3}
                  value={newProductDescription}
                  onChange={(e) => setNewProductDescription(e.target.value)}
                  placeholder="Tulis spesifikasi, ukuran, dan deskripsi produk..." 
                  className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded bg-[#F5F3F0] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] text-xs font-body text-[#1F1B18]"
                />
              </div>

              <div className="space-y-3 text-left border border-[#EAE5E0] rounded-lg p-4 bg-[#FCFCFA]">
                <p className="text-[11px] uppercase tracking-wider text-[#8E8680] font-bold">Detail Produk (Informasi Produk)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] text-[#8E8680]">Bahan</label>
                    <input
                      type="text"
                      value={newProductBahan}
                      onChange={(e) => setNewProductBahan(e.target.value)}
                      placeholder="Keramik Porselen"
                      className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] text-xs text-[#1F1B18]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] text-[#8E8680]">Asal Produk</label>
                    <input
                      type="text"
                      value={newProductAsal}
                      onChange={(e) => setNewProductAsal(e.target.value)}
                      placeholder="Kasongan, Yogyakarta"
                      className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] text-xs text-[#1F1B18]"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label className="block text-[11px] text-[#8E8680]">Ketahanan / Perawatan</label>
                    <input
                      type="text"
                      value={newProductKetahanan}
                      onChange={(e) => setNewProductKetahanan(e.target.value)}
                      placeholder="Microwave & Dishwasher Safe"
                      className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] text-xs text-[#1F1B18]"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label className="block text-[11px] text-[#8E8680]">Info Tambahan</label>
                    <textarea
                      rows={2}
                      value={newProductInfoTambahan}
                      onChange={(e) => setNewProductInfoTambahan(e.target.value)}
                      placeholder="Paragraf singkat di bawah tabel informasi produk..."
                      className="w-full px-3.5 py-2.5 border border-[#D5CFC9] rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] text-xs text-[#1F1B18]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-left border border-[#EAE5E0] rounded-lg p-4 bg-[#FCFCFA]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#8E8680] font-bold">Varian Produk</p>
                    <p className="text-[10px] text-[#8E8680] mt-0.5">Unggah foto thumbnail per pilihan (bukan URL)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setNewProductVariants((prev) => [
                        ...prev,
                        { label: "", options: [{ name: "", image: "", price: "" }] },
                      ])
                    }
                    className="text-[10px] font-bold text-[#1D4ED8] hover:underline whitespace-nowrap"
                  >
                    + Grup Varian
                  </button>
                </div>

                {newProductVariants.map((group, gIdx) => (
                  <div key={gIdx} className="border border-[#EAE5E0] rounded-lg p-3 bg-white space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={group.label}
                        onChange={(e) => {
                          const next = [...newProductVariants];
                          next[gIdx] = { ...next[gIdx], label: e.target.value };
                          setNewProductVariants(next);
                        }}
                        placeholder="Nama grup: Ukuran, Merk, Warna..."
                        className="flex-1 px-3 py-2 border border-[#D5CFC9] rounded text-xs font-bold text-[#1F1B18]"
                      />
                      {newProductVariants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setNewProductVariants((prev) => prev.filter((_, i) => i !== gIdx))}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Hapus grup"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] text-[#8E8680] font-semibold uppercase">Pilihan</p>
                      {group.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-[#FCFCFA] border border-[#EAE5E0]">
                          <input
                            type="text"
                            value={opt.name}
                            onChange={(e) => {
                              const next = [...newProductVariants];
                              const opts = [...next[gIdx].options];
                              opts[oIdx] = { ...opts[oIdx], name: e.target.value };
                              next[gIdx] = { ...next[gIdx], options: opts };
                              setNewProductVariants(next);
                            }}
                            placeholder="Nama pilihan (SD, SMP...)"
                            className="flex-1 min-w-[120px] px-2.5 py-2 border border-[#D5CFC9] rounded text-xs"
                          />
                          <input
                            type="number"
                            value={opt.price}
                            onChange={(e) => {
                              const next = [...newProductVariants];
                              const opts = [...next[gIdx].options];
                              opts[oIdx] = { ...opts[oIdx], price: e.target.value };
                              next[gIdx] = { ...next[gIdx], options: opts };
                              setNewProductVariants(next);
                            }}
                            placeholder="Harga"
                            className="w-24 px-2.5 py-2 border border-[#D5CFC9] rounded text-xs"
                          />
                          <label
                            className={`relative w-11 h-11 flex-shrink-0 rounded border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden ${
                              opt.image ? "border-[#1D4ED8]" : "border-[#D5CFC9] hover:border-[#1D4ED8]"
                            }`}
                            title="Unggah foto varian"
                          >
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              disabled={variantUploading === `${gIdx}-${oIdx}`}
                              onChange={(e) => handleVariantImageUpload(gIdx, oIdx, e)}
                            />
                            {variantUploading === `${gIdx}-${oIdx}` ? (
                              <span className="material-symbols-outlined text-[18px] text-[#1D4ED8] animate-spin">progress_activity</span>
                            ) : opt.image ? (
                              <img src={opt.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-[20px] text-[#8E8680]">add_photo_alternate</span>
                            )}
                          </label>
                          {opt.image && (
                            <button
                              type="button"
                              onClick={() => setVariantOptionImage(gIdx, oIdx, "")}
                              className="text-[10px] text-red-600 font-bold hover:underline"
                            >
                              Hapus foto
                            </button>
                          )}
                          {newProductImages.length > 0 && (
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) setVariantOptionImage(gIdx, oIdx, e.target.value);
                              }}
                              className="text-[10px] px-2 py-1.5 border border-[#D5CFC9] rounded bg-white max-w-[140px]"
                            >
                              <option value="">Pakai foto produk...</option>
                              {newProductImages.map((img, imgIdx) => (
                                <option key={imgIdx} value={img}>
                                  Foto produk {imgIdx + 1}
                                </option>
                              ))}
                            </select>
                          )}
                          {group.options.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...newProductVariants];
                                next[gIdx] = {
                                  ...next[gIdx],
                                  options: next[gIdx].options.filter((_, i) => i !== oIdx),
                                };
                                setNewProductVariants(next);
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded ml-auto"
                              title="Hapus pilihan"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...newProductVariants];
                          next[gIdx] = {
                            ...next[gIdx],
                            options: [...next[gIdx].options, { name: "", image: "", price: "" }],
                          };
                          setNewProductVariants(next);
                        }}
                        className="text-[10px] font-bold text-[#1D4ED8] hover:underline"
                      >
                        + Tambah Pilihan
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#EAE5E0]">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-[#D5CFC9] text-[#5C5550] hover:bg-[#F5F3F0] text-xs font-bold rounded transition"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#1D4ED8] text-white text-xs font-bold rounded hover:bg-blue-700 transition"
                >
                  {editingProduct ? "Simpan Perubahan" : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
