import zipfile, xml.etree.ElementTree as ET
import re

def extract_text():
    try:
        with open(r'e:\Projects\Thornix-LandingPage\docs\extracted_pptx.txt', 'w', encoding='utf-8') as out_f:
            with zipfile.ZipFile(r'e:\Projects\Thornix-LandingPage\docs\THRONIX_Oil_and_Gas_Deck.pptx') as z:
                slides = [f for f in z.namelist() if f.startswith('ppt/slides/slide') and f.endswith('.xml')]
                
                def get_num(name):
                    m = re.search(r'slide(\d+)\.xml', name)
                    return int(m.group(1)) if m else 0
                    
                slides.sort(key=get_num)
                for f in slides:
                    xml_content = z.read(f)
                    root = ET.fromstring(xml_content)
                    text_nodes = root.findall('.//{http://schemas.openxmlformats.org/drawingml/2006/main}t')
                    out_f.write(f'--- {f} ---\n')
                    for node in text_nodes:
                        if node.text:
                            out_f.write(node.text + '\n')
    except Exception as e:
        print('Error:', e)

if __name__ == '__main__':
    extract_text()
