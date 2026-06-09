const STORAGE_KEY = 'flashcards_v1'
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycby8cl9_0o94b_Fjm5U-8Bb5dAoWjaZUz0qc4s1xM2w/dev'

class FlashcardApp {
  constructor(){
    this.cards = []
    this.index = 0
    this.isFlipped = false
    this.editingId = null
    this.filtered = []
    this.autoTranslatedFor = null
    this.supplementCache = {}

    // DOM
    this.form = document.getElementById('cardForm')
    this.inputFront = document.getElementById('inputFront')
    this.inputBack = document.getElementById('inputBack')
    this.translateStatus = document.getElementById('translateStatus')
    this.cancelEditBtn = document.getElementById('cancelEditBtn')
    this.cardList = document.getElementById('cardList')
    this.search = document.getElementById('search')

    this.shuffleBtn = document.getElementById('shuffleBtn')
    this.startStudyBtn = document.getElementById('startStudyBtn')
    this.exportBtn = document.getElementById('exportBtn')
    this.importFile = document.getElementById('importFile')
    this.autoFillBtn = document.getElementById('autoFillBtn')

    this.cardView = document.getElementById('cardView')
    this.studyCard = document.getElementById('studyCard')
    this.cardFront = document.getElementById('cardFront')
    this.cardBack = document.getElementById('cardBack')
    this.prevBtn = document.getElementById('prevBtn')
    this.nextBtn = document.getElementById('nextBtn')
    this.flipBtn = document.getElementById('flipBtn')
    this.knownBtn = document.getElementById('knownBtn')
    this.progressBar = document.getElementById('progressBar')

    this.addEventListeners()
    this.load()
    this.renderList()
    this.updateStudyView()
  }

  addEventListeners(){
    this.form.addEventListener('submit', e=>{e.preventDefault(); this.saveCard()})
    this.cancelEditBtn.addEventListener('click', ()=>this.resetForm())
    this.search.addEventListener('input', ()=>this.renderList())

    this.shuffleBtn.addEventListener('click', ()=>{this.shuffle(); this.startStudy()})
    this.startStudyBtn.addEventListener('click', ()=>this.startStudy())
    this.exportBtn.addEventListener('click', ()=>this.exportJSON())
    this.importFile.addEventListener('change', e=>this.importJSON(e.target.files[0]))
    this.autoFillBtn.addEventListener('click', ()=>this.lookupTranslation(true))
    this.inputFront.addEventListener('input', debounce(()=>this.lookupTranslation(), 700))

    this.cardView.addEventListener('click', e=>{
      if(e.target.closest('.card')) this.flipCard()
    })
    this.flipBtn.addEventListener('click', ()=>this.flipCard())
    this.nextBtn.addEventListener('click', ()=>this.next())
    this.prevBtn.addEventListener('click', ()=>this.prev())
    this.knownBtn.addEventListener('click', ()=>this.markKnown())
  }

  load(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY)
      if(raw) this.cards = JSON.parse(raw)
    }catch(e){console.warn('load failed',e)}
    this.filtered = this.cards.slice()
  }

  save(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cards))
  }

  generateId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}

  saveCard(){
    const front = this.inputFront.value.trim()
    const back = this.inputBack.value.trim()
    if(!front || !back){alert('前或後內容不可為空'); return}

    if(this.editingId){
      const card = this.cards.find(c=>c.id===this.editingId)
      if(card){card.front=front; card.back=back}
      this.editingId = null
    } else {
      this.cards.push({id:this.generateId(),front,back,known:false,created:Date.now()})
    }
    this.save(); this.resetForm(); this.renderList();
  }

  resetForm(){this.form.reset(); this.editingId = null; this.autoTranslatedFor = null; this.setTranslateStatus('輸入英文單字後，會自動查詢中文翻譯。')}

  setTranslateStatus(text){
    if(this.translateStatus) this.translateStatus.textContent = text
  }

  async lookupTranslation(force = false){
    const front = this.inputFront.value.trim()
    if(!front || !/^[A-Za-z\s]+$/.test(front)){
      this.autoTranslatedFor = null
      this.setTranslateStatus('請輸入英文單字，自動查中文翻譯。')
      return
    }

    if(this.autoTranslatedFor === front && !force) return
    if(this.inputBack.value.trim() && this.autoTranslatedFor !== front && !force) {
      this.setTranslateStatus('已偵測手動內容，不覆寫現有解釋。')
      return
    }

    this.setTranslateStatus('查詢中文翻譯中...')
    const result = await this.fetchChineseTranslation(front)
    if(result){
      this.inputBack.value = result
      this.autoTranslatedFor = front
      this.setTranslateStatus('已自動填入中文翻譯，可直接儲存或自行編輯。')
    } else {
      this.setTranslateStatus('查無翻譯結果，請自行輸入中文解釋。')
    }
  }

  async fetchChineseTranslation(word){
    try{
      const url = 'https://api.mymemory.translated.net/get?langpair=en|zh-TW&q=' + encodeURIComponent(word)
      const res = await fetch(url)
      if(!res.ok) return null
      const data = await res.json()
      const translated = data?.responseData?.translatedText
      return translated && translated !== word ? translated : null
    }catch(err){
      console.warn('translation failed', err)
      return null
    }
  }

  renderList(){
    const q = this.search.value.trim().toLowerCase()
    const list = this.cards.filter(c=> c.front.toLowerCase().includes(q) || c.back.toLowerCase().includes(q))
    this.filtered = list
    this.cardList.innerHTML = ''
    if(list.length===0){ this.cardList.innerHTML = '<li class="meta">尚無符合的卡片</li>'; return }
    list.forEach(c=>{
      const li = document.createElement('li')
      const left = document.createElement('div'); left.innerHTML = `<strong>${escapeHTML(c.front)}</strong><div class="meta">${escapeHTML(c.back)}</div>`
      const actions = document.createElement('div'); actions.className='actions'
      const edit = document.createElement('button'); edit.textContent='編輯'; edit.addEventListener('click', ()=>this.startEdit(c.id))
      const del = document.createElement('button'); del.textContent='刪除'; del.addEventListener('click', ()=>this.deleteCard(c.id))
      const known = document.createElement('button'); known.textContent = c.known? '已會' : '未會'; known.addEventListener('click', ()=>{c.known=!c.known; this.save(); this.renderList()})
      actions.appendChild(known); actions.appendChild(edit); actions.appendChild(del)
      li.appendChild(left); li.appendChild(actions)
      this.cardList.appendChild(li)
    })
  }

  startEdit(id){
    const c = this.cards.find(x=>x.id===id); if(!c) return
    this.inputFront.value = c.front; this.inputBack.value = c.back; this.editingId = id
    window.scrollTo({top:0,behavior:'smooth'})
  }

  deleteCard(id){
    if(!confirm('確定要刪除此卡片？')) return
    this.cards = this.cards.filter(c=>c.id!==id); this.save(); this.renderList();
  }

  shuffle(){
    for(let i=this.cards.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[this.cards[i],this.cards[j]]=[this.cards[j],this.cards[i]]}
    this.save(); this.filtered = this.cards.slice()
  }

  startStudy(){
    if(this.cards.length===0){alert('尚未建立任何卡片'); return}
    this.index = 0; this.isFlipped=false; this.cardView.classList.remove('empty'); this.updateStudyView()
  }

  updateStudyView(){
    if(this.filtered.length===0){ this.cardFront.textContent='(沒有卡片)'; this.cardBack.innerHTML=''; this.progressBar.style.width='0%'; return }
    const c = this.filtered[this.index] || this.filtered[0]
    this.cardFront.textContent = c.front
    const supplement = this.supplementCache[c.front]
    this.cardBack.innerHTML = this.renderBackContent(c, supplement)
    this.studyCard.classList.toggle('flipped', this.isFlipped)
    this.updateProgress()
  }

  renderBackContent(card, supplement){
    const lines = []
    if(card.back){
      lines.push(`<div class="back-main">${escapeHTML(card.back)}</div>`)
    }
    if(supplement){
      if(supplement.loading){
        lines.push('<div class="back-loading">查詢補充資訊中...</div>')
      } else {
        if(supplement.translation){
          lines.push(`<div class="back-field"><span>翻譯：</span>${escapeHTML(supplement.translation)}</div>`)
        }
        if(supplement.partOfSpeech){
          lines.push(`<div class="back-field"><span>詞性：</span>${escapeHTML(supplement.partOfSpeech)}</div>`)
        }
        if(supplement.origin){
          lines.push(`<div class="back-field"><span>字根分析：</span>${escapeHTML(supplement.origin)}</div>`)
        }
        if(supplement.example){
          lines.push(`<div class="back-field"><span>例句：</span>${escapeHTML(supplement.example)}</div>`)
        }
        if(supplement.definition){
          lines.push(`<div class="back-field"><span>定義：</span>${escapeHTML(supplement.definition)}</div>`)
        }
        if(!supplement.translation && !supplement.partOfSpeech && !supplement.origin && !supplement.example && !supplement.definition){
          lines.push('<div class="back-loading">查無補充資訊。</div>')
        }
      }
    } else {
      lines.push('<div class="back-loading">翻面時會補充詞性、例句與字根分析。</div>')
    }
    return lines.join('')
  }

  async loadSupplement(word){
    if(!word) return null
    this.supplementCache[word] = {loading:true}
    this.updateStudyView()
    const result = await this.fetchWordDetails(word)
    this.supplementCache[word] = result || {translation:null,partOfSpeech:null,origin:null,example:null,definition:null}
    this.updateStudyView()
    return this.supplementCache[word]
  }

  async fetchWordDetails(word){
    try{
      const dictUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word)
      const response = await fetch(dictUrl)
      if(!response.ok) return null
      const data = await response.json()
      const first = Array.isArray(data) ? data[0] : null
      if(!first) return null
      const partOfSpeech = first.meanings?.[0]?.partOfSpeech || ''
      const definition = first.meanings?.[0]?.definitions?.[0]?.definition || ''
      const example = first.meanings?.[0]?.definitions?.[0]?.example || ''
      const origin = first.origin || ''
      const translation = await this.fetchChineseTranslation(word)
      return {translation,partOfSpeech,origin,example,definition}
    }catch(err){
      console.warn('fetchWordDetails failed', err)
      return null
    }
  }

  async flipCard(){
    this.isFlipped = !this.isFlipped
    this.updateStudyView()
    if(this.isFlipped){
      const c = this.filtered[this.index]
      if(c && !this.supplementCache[c.front]){
        await this.loadSupplement(c.front)
      }
    }
  }

  next(){ if(this.filtered.length===0) return; this.index = (this.index+1) % this.filtered.length; this.isFlipped=false; this.updateStudyView() }
  prev(){ if(this.filtered.length===0) return; this.index = (this.index-1+this.filtered.length) % this.filtered.length; this.isFlipped=false; this.updateStudyView() }

  markKnown(){ if(this.filtered.length===0) return; const c = this.filtered[this.index]; c.known = true; this.save(); this.renderList(); this.next() }

  updateProgress(){ if(this.filtered.length===0){this.progressBar.style.width='0%'; return} const pct = Math.round((this.index+1)/this.filtered.length*100); this.progressBar.style.width = pct + '%' }

  exportJSON(){
    const data = JSON.stringify(this.cards, null, 2)
    const blob = new Blob([data], {type:'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'flashcards.json'; a.click(); URL.revokeObjectURL(url)
  }

  importJSON(file){
    if(!file) return
    const reader = new FileReader()
    reader.onload = e=>{
      try{
        const arr = JSON.parse(e.target.result)
        if(!Array.isArray(arr)) throw new Error('格式錯誤')
        // validate entries
        const valid = arr.filter(it=>it.front && it.back).map(it=>({id:this.generateId(),front:String(it.front),back:String(it.back),known:!!it.known,created:Date.now()}))
        this.cards = this.cards.concat(valid)
        this.save(); this.renderList(); alert('匯入完成，新增 ' + valid.length + ' 張卡片')
      }catch(err){alert('匯入失敗：'+err.message)}
    }
    reader.readAsText(file)
    this.importFile.value = null
  }
}
function debounce(fn, delay){
  let handle = null
  return (...args)=>{
    clearTimeout(handle)
    handle = setTimeout(()=>fn(...args), delay)
  }
}
function escapeHTML(s){return String(s).replace(/[&<>"]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]))}

document.addEventListener('DOMContentLoaded', ()=>{
  const app = new FlashcardApp()
})
