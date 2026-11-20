/* 시연판 설정. Supabase 주소와 공개용(publishable/anon) 키는 브라우저에 공개되도록 만들어진 값이다.
   쓰기 권한은 데이터베이스의 행 수준 보안(RLS)과 편집자 목록(editors)이 막는다.
   비어 있으면 사이트는 정적 시안 내용으로 동작한다. */
window.VK_CONFIG = {
  supabaseUrl: 'https://inkaxcxdgrsluikccsln.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlua2F4Y3hkZ3JzbHVpa2Njc2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUxOTE4ODEsImV4cCI6MjExMDc2Nzg4MX0.C22r9VBN0LufcP7VqdxNCmQBeoOWjl2BTgLjOMKBVZU',
  loginDomain: 'example.com',
  sites: {
    cover: 'https://vk-proposal.vercel.app',
    a: 'https://vk-proposal-a.vercel.app',
    b: 'https://vk-proposal-b.vercel.app'
  }
};
