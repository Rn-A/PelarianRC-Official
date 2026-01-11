
import React, { useState } from 'react';
import { Database, Article } from '../../../types';
import ReactQuill from 'react-quill-new';

interface CMSArticlesProps {
  db: Database;
  onUpdate: (db: Database) => void;
}

const CMSArticles: React.FC<CMSArticlesProps> = ({ db, onUpdate }) => {
  const [editing, setEditing] = useState<Partial<Article> | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'author' | 'main') => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (type === 'author') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditing(prev => ({ ...prev, authorPhoto: reader.result as string }));
        };
        reader.readAsDataURL(files[0]);
      } else {
        const readers = Array.from(files).map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        });
        Promise.all(readers).then(images => {
          setEditing(prev => ({ ...prev, images: [...(prev?.images || []), ...images] }));
        });
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    let newList = [...db.articles];
    if (editing.id) {
      newList = newList.map(a => a.id === editing.id ? (editing as Article) : a);
    } else {
      newList.push({ ...editing, id: 'a' + Date.now().toString() } as Article);
    }
    onUpdate({ ...db, articles: newList });
    setEditing(null);
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black uppercase tracking-tighter">Manage <span className="text-[#0C61BC]">Articles</span></h2>
        {!editing && (
          <button 
            onClick={() => setEditing({ title: '', date: new Date().toISOString().split('T')[0], category: 'Tips Lari', authorName: '', authorPhoto: '', authorRole: 'Member', images: [], description: '' })}
            className="bg-[#0C61BC] hover:bg-white hover:text-black px-6 py-3 rounded-xl font-bold transition-all transform active:scale-95 shadow-lg shadow-[#0C61BC]/20 uppercase text-xs tracking-widest"
          >
            + Tulis Artikel Baru
          </button>
        )}
      </div>

      {editing ? (
        <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 mb-10 shadow-2xl">
          <h3 className="text-xl font-bold mb-6 text-[#0C61BC] uppercase tracking-tighter italic">Drafting Artikel</h3>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full">
              <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Judul Artikel</label>
              <input type="text" required className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#0C61BC] outline-none font-bold" 
                value={editing.title} onChange={e => setEditing({...editing, title: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Penulis</label>
              <input type="text" required className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#0C61BC] outline-none" 
                value={editing.authorName} onChange={e => setEditing({...editing, authorName: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Role Penulis</label>
              <input type="text" required className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#0C61BC] outline-none" 
                value={editing.authorRole} onChange={e => setEditing({...editing, authorRole: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Upload Foto Penulis</label>
              <input type="file" accept="image/*" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white file:bg-[#0C61BC] file:rounded-full file:border-0 file:text-white file:px-4 file:py-1 file:mr-4 file:text-[10px] file:font-black" 
                onChange={(e) => handleFileChange(e, 'author')} />
              {editing.authorPhoto && (
                <img src={editing.authorPhoto} className="mt-4 h-16 w-16 rounded-full object-cover border-2 border-[#0C61BC]" alt="Preview" />
              )}
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Upload Gambar Artikel (Bisa > 1)</label>
              <input type="file" multiple accept="image/*" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white file:bg-[#0C61BC] file:rounded-full file:border-0 file:text-white file:px-4 file:py-1 file:mr-4 file:text-[10px] file:font-black" 
                onChange={(e) => handleFileChange(e, 'main')} />
              <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
                {editing.images?.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img src={img} className="h-16 w-24 rounded-lg object-cover border border-white/10" alt="Preview" />
                    <button 
                      type="button"
                      onClick={() => setEditing(prev => ({ ...prev, images: prev?.images?.filter((_, i) => i !== idx) }))}
                      className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 text-[8px] font-black"
                    >X</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-full mb-12">
              <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Konten Artikel</label>
              <div className="bg-black rounded-xl overflow-hidden min-h-[400px]">
                <ReactQuill 
                  theme="snow"
                  value={editing.description}
                  onChange={(content: string) => setEditing({...editing, description: content})}
                  modules={quillModules}
                />
              </div>
            </div>

            <div className="col-span-full flex gap-4 pt-8 border-t border-white/5">
              <button 
                type="submit" 
                className="flex-1 bg-[#0C61BC] px-10 py-4 rounded-xl font-black text-white shadow-lg hover:bg-white hover:text-black transition-all transform active:scale-95 uppercase tracking-widest"
              >
                TERBITKAN ARTIKEL
              </button>
              <button 
                type="button" 
                onClick={() => setEditing(null)} 
                className="flex-1 bg-gray-800 px-10 py-4 rounded-xl font-black hover:bg-gray-700 transition-all transform active:scale-95 uppercase tracking-widest"
              >
                BATAL
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {db.articles.map(article => (
            <div key={article.id} className="bg-[#1a1a1a] p-6 rounded-[2rem] flex items-center justify-between border border-white/5 group hover:border-[#0C61BC]/50 transition-all shadow-xl">
              <div className="flex items-center gap-4">
                <img src={article.images[0]} className="w-20 h-20 rounded-2xl object-cover border border-white/10" alt="" />
                <div>
                  <h4 className="font-black text-lg group-hover:text-[#0C61BC] transition-colors uppercase tracking-tight">{article.title}</h4>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest italic">{article.date} • By {article.authorName}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(article)} className="p-3 bg-[#0C61BC]/10 text-[#0C61BC] rounded-xl hover:bg-[#0C61BC] hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">Edit</button>
                <button onClick={() => {if(confirm('Hapus artikel?')) onUpdate({...db, articles: db.articles.filter(a => a.id !== article.id)})}} className="p-3 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CMSArticles;
