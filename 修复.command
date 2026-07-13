#!/bin/bash
echo "========================================"
echo "  绘声 - 修复隔离属性"
echo "========================================"
echo ""
echo "正在修复 /Applications/绘声.app ..."
echo ""

xattr -cr /Applications/绘声.app 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ 修复完成！请重新打开绘声"
    echo ""
    echo "正在打开绘声..."
    open /Applications/绘声.app
else
    echo "❌ 修复失败"
    echo "请确认绘声已安装到 /Applications/ 目录"
fi

echo ""
echo "按回车键退出..."
read
