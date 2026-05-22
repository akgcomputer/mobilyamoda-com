export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

// Mock veri (D1 yerine)
export const posts: Post[] = [
  {
    id: 1,
    title: 'Meraklı İçerik 1',
    slug: 'icerik-1',
    content: '<p>Bu bir test içeriğidir. İçerik yönetimi yakında eklenecek.</p>',
    excerpt: 'Test içerik özeti',
    status: 'published',
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: 2,
    title: 'Meraklı İçerik 2',
    slug: 'icerik-2',
    content: '<p>İkinci test içeriği.</p>',
    excerpt: 'İkinci test',
    status: 'published',
    created_at: '2024-01-02',
    updated_at: '2024-01-02'
  }
];

export async function getPosts() {
  return posts.filter(p => p.status === 'published');
}

export async function getPostBySlug(slug: string) {
  return posts.find(p => p.slug === slug && p.status === 'published');
}

export async function getAllPosts() {
  return posts;
}

export async function createPost(data: any) {
  const newPost = {
    id: posts.length + 1,
    ...data,
    created_at: new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString().split('T')[0]
  };
  posts.push(newPost);
  return newPost;
}

export async function updatePost(id: number, data: any) {
  const index = posts.findIndex(p => p.id === id);
  if (index !== -1) {
    posts[index] = { ...posts[index], ...data, updated_at: new Date().toISOString().split('T')[0] };
    return posts[index];
  }
  return null;
}

export async function deletePost(id: number) {
  const index = posts.findIndex(p => p.id === id);
  if (index !== -1) {
    posts.splice(index, 1);
    return true;
  }
  return false;
}