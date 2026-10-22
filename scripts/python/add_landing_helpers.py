with open('dist/index.html', 'r', encoding='utf-8') as f:
    c = f.read()

helper_script = '''
<script>
  // Helper de interactividad para Landing: Copiar CLABE y FAQ Accordion
  document.addEventListener('DOMContentLoaded', function() {
    // Copiar CLABE
    document.querySelectorAll('button').forEach(btn => {
      if (btn.textContent.trim().includes('Copiar')) {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          const clabe = '012180012345678901';
          if (navigator.clipboard) {
            navigator.clipboard.writeText(clabe).then(() => {
              btn.textContent = '✓ Copiado';
              setTimeout(() => { btn.textContent = 'Copiar'; }, 2200);
            });
          }
        });
      }
    });

    // FAQ Accordion
    const faqButtons = document.querySelectorAll('#faq button, section[id*="faq"] button');
    faqButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const answer = btn.nextElementSibling;
        if (answer) {
          const isHidden = answer.classList.contains('hidden');
          // cerrar otros si se desea o simplemente toggle
          if (isHidden) {
            answer.classList.remove('hidden');
          } else {
            answer.classList.add('hidden');
          }
        }
      });
    });
  });
</script>
'''

if '</body>' in c and 'Helper de interactividad para Landing' not in c:
    c = c.replace('</body>', helper_script + '\n</body>')
    with open('dist/index.html', 'w', encoding='utf-8') as f:
        f.write(c)
    print("Added landing interaction helpers!")
else:
    print("Already added or no </body>")
