suite('Global Tests', function(){
  test('Page has a valid title',function(){
    assert( document.title && document.title.match(/\s/) && document.title.toUpperCase() !== 'TODO');
  });
});
